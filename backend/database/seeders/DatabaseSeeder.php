<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $ahora = now();
        $password = Hash::make('sabitech');

        $usuario = fn ($nombre, $apellidos, $email, $perfil) => DB::table('users')->insertGetId([
            'nombre' => $nombre, 'apellidos' => $apellidos, 'email' => $email, 'perfil' => $perfil,
            'activo' => true, 'password' => $password, 'email_verified_at' => $ahora,
            'created_at' => $ahora, 'updated_at' => $ahora,
        ]);

        $usuario('Carlos', 'Rubiño Selva', 'carlos@sabitech.test', 'organizacion');
        $usuario('Óscar', 'Reguera Lozano', 'oscar@sabitech.test', 'organizacion');
        $acceso = $usuario('Andrés', 'Puerta Gil', 'acceso@sabitech.test', 'acceso');
        $ana    = $usuario('Ana', 'García López', 'ana@sabitech.test', 'asistente');
        $luis   = $usuario('Luis', 'Martín Ruiz', 'luis@sabitech.test', 'asistente');
        $marta  = $usuario('Marta', 'Sanz Ortega', 'marta@sabitech.test', 'asistente');
        $pablo  = $usuario('Pablo', 'Navarro Vidal', 'pablo@sabitech.test', 'asistente');

        $sala = fn ($nombre, $ubicacion, $capacidad) => DB::table('salas')->insertGetId([
            'nombre' => $nombre, 'ubicacion' => $ubicacion, 'capacidad' => $capacidad,
            'created_at' => $ahora, 'updated_at' => $ahora,
        ]);

        $auditorio = $sala('Auditorio', 'Edificio principal, planta baja', 120);
        $aula      = $sala('Aula 2.1', 'Edificio principal, 2ª planta', 30);
        $lab       = $sala('Laboratorio 3.4', 'Edificio principal, 3ª planta', 20);

        $ponente = fn ($nombre, $apellidos, $empresa, $bio) => DB::table('ponentes')->insertGetId([
            'nombre' => $nombre, 'apellidos' => $apellidos, 'empresa' => $empresa, 'biografia' => $bio,
            'created_at' => $ahora, 'updated_at' => $ahora,
        ]);

        $irene = $ponente('Irene', 'Castell Mora', 'Nubeloop Systems', 'Desarrolladora backend especializada en APIs con Laravel.');
        $hugo  = $ponente('Hugo', 'Valero Ríos', 'Pixelaria Studio', 'Desarrollador frontend especializado en React.');
        $nuria = $ponente('Nuria', 'Esteve Camps', 'Accede Consultoría', 'Consultora de accesibilidad web.');

        $charla = fn ($titulo, $desc, $ponenteId, $salaId, $fecha, $ini, $fin, $aforo, $estado = 'publicada') => DB::table('charlas')->insertGetId([
            'titulo' => $titulo, 'slug' => Str::slug($titulo), 'descripcion' => $desc,
            'ponente_id' => $ponenteId, 'sala_id' => $salaId, 'fecha' => $fecha,
            'hora_inicio' => $ini, 'hora_fin' => $fin, 'aforo' => $aforo, 'estado' => $estado,
            'created_at' => $ahora, 'updated_at' => $ahora,
        ]);

        $git     = $charla('Git en equipo sin dramas', 'Ramas y conflictos en proyectos en pareja.', $irene, $aula, '2026-11-03', '17:00', '18:00', 25);
        $laravel = $charla('Laravel en producción', 'Cómo preparar una API Laravel para producción.', $irene, $auditorio, '2027-03-10', '10:00', '11:00', 100);
        $react   = $charla('React sin miedo', 'Componentes, estado y consumo de APIs en React.', $hugo, $aula, '2027-03-10', '11:30', '12:30', 25);
        $acces   = $charla('Accesibilidad web práctica', 'Taller con aforo muy reducido.', $nuria, $lab, '2027-03-10', '16:00', '17:30', 2);
        $charla('Docker para el día a día', 'Pendiente de confirmar.', $irene, $aula, '2027-03-11', '12:00', '13:00', 25, 'borrador');
        $charla('Diseño de interfaces con IA', 'Charla cancelada por la organización.', $hugo, $auditorio, '2027-03-11', '16:00', '17:00', 80, 'cancelada');

        $reserva = function ($userId, $charlaId, $estado = 'confirmada', $correo = 'enviada') use ($ahora) {
            $id = DB::table('reservas')->insertGetId([
                'codigo' => 'SBT-' . strtoupper(Str::random(6)), 'user_id' => $userId, 'charla_id' => $charlaId,
                'estado' => $estado, 'qr_secreto' => Str::random(64),
                'cancelada_at' => $estado === 'cancelada' ? $ahora : null,
                'created_at' => $ahora, 'updated_at' => $ahora,
            ]);
            DB::table('notificaciones')->insert([
                'reserva_id' => $id, 'tipo' => 'confirmacion',
                'destinatario' => DB::table('users')->where('id', $userId)->value('email'),
                'estado' => $correo, 'intentos' => 1,
                'ultimo_error' => $correo === 'fallida' ? 'Simulado: el servidor de correo no respondió.' : null,
                'enviada_at' => $correo === 'enviada' ? $ahora : null,
                'created_at' => $ahora, 'updated_at' => $ahora,
            ]);
            return $id;
        };

        $reserva($ana, $acces);
        $reserva($luis, $acces);
        $reserva($pablo, $acces, 'cancelada');

        $reserva($ana, $laravel);
        $reserva($marta, $laravel, 'confirmada', 'fallida');

        $reserva($luis, $react);

        $rMarta = $reserva($marta, $git);
        $rLuis  = $reserva($luis, $git);
        $reserva($pablo, $git);

        DB::table('asistencias')->insert([
            ['reserva_id' => $rMarta, 'registrada_por' => $acceso, 'metodo' => 'qr', 'registrada_at' => '2026-11-03 16:52:00', 'observaciones' => null, 'created_at' => $ahora, 'updated_at' => $ahora],
            ['reserva_id' => $rLuis, 'registrada_por' => $acceso, 'metodo' => 'manual', 'registrada_at' => '2026-11-03 16:58:00', 'observaciones' => 'Sin batería en el móvil; identidad comprobada por el personal.', 'created_at' => $ahora, 'updated_at' => $ahora],
        ]);
    }
}