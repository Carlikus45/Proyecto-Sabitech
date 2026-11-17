<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use PDOException;

class ReservaController extends Controller
{
    public function store(Request $request)
    {
        $usuario = $request->user();

        if ($usuario->perfil != 'asistente') {
            return response()->json(array('mensaje' => 'Solo los asistentes pueden reservar plaza.'), 403);
        }

        $charlaId = $request->get('charla_id');
        if (!is_numeric($charlaId)) {
            return response()->json(array('mensaje' => 'Indica la charla que quieres reservar.'), 422);
        }

        $pdo = DB::connection()->getPdo();

        try {
            $pdo->beginTransaction();

            $stmt = $pdo->prepare("SELECT id, fecha, aforo, estado FROM charlas WHERE id = :id FOR UPDATE");
            $stmt->execute(array(':id' => $charlaId));
            $charla = $stmt->fetch();

            if ($charla == false || $charla['estado'] != 'publicada') {
                $pdo->rollBack();
                return response()->json(array('mensaje' => 'La charla no existe o no está disponible.'), 404);
            }

            if ($charla['fecha'] < date('Y-m-d')) {
                $pdo->rollBack();
                return response()->json(array('mensaje' => 'Esta charla ya se ha celebrado.'), 422);
            }

            $stmt = $pdo->prepare("SELECT id, estado FROM reservas WHERE user_id = :usuario AND charla_id = :charla");
            $stmt->execute(array(':usuario' => $usuario->id, ':charla' => $charlaId));
            $reservaPrevia = $stmt->fetch();

            if ($reservaPrevia != false && $reservaPrevia['estado'] == 'confirmada') {
                $pdo->rollBack();
                return response()->json(array('mensaje' => 'Ya tienes una reserva para esta charla.'), 409);
            }

            $stmt = $pdo->prepare("SELECT COUNT(*) AS total FROM reservas WHERE charla_id = :charla AND estado = 'confirmada'");
            $stmt->execute(array(':charla' => $charlaId));
            $ocupadas = $stmt->fetch();

            if ($ocupadas['total'] >= $charla['aforo']) {
                $pdo->rollBack();
                return response()->json(array('mensaje' => 'Lo sentimos, no quedan plazas.'), 409);
            }

            $qrSecreto = bin2hex(random_bytes(32));

            if ($reservaPrevia != false) {
                $stmt = $pdo->prepare("UPDATE reservas SET estado = 'confirmada', cancelada_at = NULL, qr_secreto = :secreto, updated_at = NOW()
                                       WHERE id = :id");
                $stmt->execute(array(':secreto' => $qrSecreto, ':id' => $reservaPrevia['id']));
                $reservaId = $reservaPrevia['id'];
            } else {
                $codigo = 'SBT-' . strtoupper(bin2hex(random_bytes(3)));
                $stmt = $pdo->prepare("INSERT INTO reservas (codigo, user_id, charla_id, estado, qr_secreto, created_at, updated_at)
                                       VALUES (:codigo, :usuario, :charla, 'confirmada', :secreto, NOW(), NOW())");
                $stmt->execute(array(':codigo' => $codigo, ':usuario' => $usuario->id, ':charla' => $charlaId, ':secreto' => $qrSecreto));
                $reservaId = $pdo->lastInsertId();
            }

            $stmt = $pdo->prepare("INSERT INTO notificaciones (reserva_id, tipo, destinatario, estado, intentos, created_at, updated_at)
                                   VALUES (:reserva, 'confirmacion', :email, 'pendiente', 0, NOW(), NOW())");
            $stmt->execute(array(':reserva' => $reservaId, ':email' => $usuario->email));

            $pdo->commit();
        } catch (PDOException $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            if ($e->getCode() == 23000) {
                return response()->json(array('mensaje' => 'Ya tienes una reserva para esta charla.'), 409);
            }
            return response()->json(array('mensaje' => 'No se ha podido guardar la reserva. Inténtalo de nuevo.'), 500);
        }

        $stmt = $pdo->prepare("SELECT codigo FROM reservas WHERE id = :id");
        $stmt->execute(array(':id' => $reservaId));
        $reserva = $stmt->fetch();

        return response()->json(array(
            'mensaje' => 'Reserva confirmada.',
            'reserva_id' => $reservaId,
            'codigo' => $reserva['codigo'],
        ), 201);
    }

    public function misReservas(Request $request)
    {
        $pdo = DB::connection()->getPdo();

        $stmt = $pdo->prepare("SELECT r.id, r.codigo, r.estado, c.id AS charla_id, c.titulo, c.slug, c.fecha,
                                      c.hora_inicio, c.hora_fin, s.nombre AS sala, s.ubicacion, a.registrada_at
                               FROM reservas r
                               JOIN charlas c ON c.id = r.charla_id
                               JOIN salas s ON s.id = c.sala_id
                               LEFT JOIN asistencias a ON a.reserva_id = r.id
                               WHERE r.user_id = :usuario
                               ORDER BY c.fecha, c.hora_inicio");
        $stmt->execute(array(':usuario' => $request->user()->id));
        $filas = $stmt->fetchAll();

        $reservas = array();
        foreach ($filas as $fila) {
            $reservas[] = array(
                'id' => $fila['id'],
                'codigo' => $fila['codigo'],
                'estado' => $fila['estado'],
                'asistencia_registrada' => $fila['registrada_at'] != null,
                'charla_id' => $fila['charla_id'],
                'titulo' => $fila['titulo'],
                'slug' => $fila['slug'],
                'fecha' => $fila['fecha'],
                'hora_inicio' => $fila['hora_inicio'],
                'hora_fin' => $fila['hora_fin'],
                'sala' => $fila['sala'],
                'ubicacion' => $fila['ubicacion'],
            );
        }

        return $reservas;
    }
}