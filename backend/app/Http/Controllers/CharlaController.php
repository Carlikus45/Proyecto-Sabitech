<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class CharlaController extends Controller
{
    public function index()
    {
        $pdo = DB::connection()->getPdo();

        $sql = $this->consultaBase() . " ORDER BY c.fecha, c.hora_inicio";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $filas = $stmt->fetchAll();

        $charlas = array();
        foreach ($filas as $fila) {
            $charlas[] = $this->formatear($fila);
        }

        return $charlas;
    }

    public function show($slug)
    {
        $pdo = DB::connection()->getPdo();

        $sql = $this->consultaBase() . " AND c.slug = :slug";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(array(':slug' => $slug));
        $fila = $stmt->fetch();

        if ($fila == false) {
            abort(404, 'Charla no encontrada');
        }

        return $this->formatear($fila);
    }

    public function consultaBase()
    {
        return "SELECT c.id, c.titulo, c.slug, c.descripcion, c.fecha,
                       c.hora_inicio, c.hora_fin, c.aforo,
                       p.nombre AS ponente_nombre, p.apellidos AS ponente_apellidos, p.empresa,
                       s.nombre AS sala, s.ubicacion,
                       (SELECT COUNT(*) FROM reservas r
                        WHERE r.charla_id = c.id AND r.estado = 'confirmada') AS ocupadas
                FROM charlas c
                JOIN ponentes p ON p.id = c.ponente_id
                JOIN salas s ON s.id = c.sala_id
                WHERE c.estado = 'publicada'";
    }

    public function formatear($fila)
    {
        $disponibles = $fila['aforo'] - $fila['ocupadas'];
        if ($disponibles < 0) {
            $disponibles = 0;
        }

        return array(
            'id' => $fila['id'],
            'titulo' => $fila['titulo'],
            'slug' => $fila['slug'],
            'descripcion' => $fila['descripcion'],
            'fecha' => $fila['fecha'],
            'hora_inicio' => $fila['hora_inicio'],
            'hora_fin' => $fila['hora_fin'],
            'aforo' => $fila['aforo'],
            'plazas_disponibles' => $disponibles,
            'ponente' => $fila['ponente_nombre'] . ' ' . $fila['ponente_apellidos'],
            'empresa' => $fila['empresa'],
            'sala' => $fila['sala'],
            'ubicacion' => $fila['ubicacion'],
        );
    }
}