<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $email = trim($request->get('email', ''));
        $password = $request->get('password', '');

        if ($email == '' || $password == '') {
            return response()->json(array('mensaje' => 'Escribe tu email y tu contraseña.'), 422);
        }

        $pdo = DB::connection()->getPdo();
        $stmt = $pdo->prepare("SELECT id, nombre, apellidos, email, perfil, activo, password
                               FROM users WHERE email = :email");
        $stmt->execute(array(':email' => $email));
        $fila = $stmt->fetch();

        if ($fila == false || !password_verify($password, $fila['password'])) {
            return response()->json(array('mensaje' => 'Email o contraseña incorrectos.'), 401);
        }

        if ($fila['activo'] == 0) {
            return response()->json(array('mensaje' => 'Esta cuenta está desactivada.'), 403);
        }

        $usuario = User::find($fila['id']);
        $token = $usuario->createToken('web')->plainTextToken;

        return array(
            'token' => $token,
            'usuario' => array(
                'id' => $fila['id'],
                'nombre' => $fila['nombre'],
                'apellidos' => $fila['apellidos'],
                'email' => $fila['email'],
                'perfil' => $fila['perfil'],
            ),
        );
    }

    public function yo(Request $request)
    {
        $usuario = $request->user();

        return array(
            'id' => $usuario->id,
            'nombre' => $usuario->nombre,
            'apellidos' => $usuario->apellidos,
            'email' => $usuario->email,
            'perfil' => $usuario->perfil,
        );
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return array('mensaje' => 'Sesión cerrada.');
    }
}