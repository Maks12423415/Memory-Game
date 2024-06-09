<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "memory_game";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$data = json_decode(file_get_contents("php://input"));

$player_name = $conn->real_escape_string($data->playerName);
$score = $conn->real_escape_string($data->score);
$moves = $conn->real_escape_string($data->moves);

$sql = "INSERT INTO scores (player_name, score, moves) VALUES ('$player_name', '$score', '$moves')";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => $conn->error]);
}

$conn->close();
?>
