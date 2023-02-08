<?php
include_once 'dbase.php';

$op = "";
$method = $_SERVER['REQUEST_METHOD'];
$data = ["ok" => true, "method" => $method, "message" => "", "data" => []];

if ($method == "GET") {
    if (isset($_GET["op"])) $op = $_GET["op"];
} else if ($method == "POST") {
    if (isset($_POST["op"])) $op = $_POST["op"];
}

// Nothing to do
if ($op == "") {
    $data["ok"] = false;
    $data["error"] = "Specify an operation please.";
    echo json_encode($data);
    die();
}

// connect
if ($op == "connect") {
    if (!isset($_POST["host"]) || !isset($_POST["user"]) || !isset($_POST["password"]) || !isset($_POST["dbName"])) {
        $data["ok"] = false;
        $data["error"] = "Incorrect parameters number.";
        die(json_encode($data));
    }
    try {
        $conn = new PDO('mysql:host=' . $_POST["host"], $_POST["user"], $_POST["password"]);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $data["message"] = "Connected to `" . $_POST["host"] . "`.";
        $dropDataBase = $_POST["dropAndCreateDatabase"] == 'true';
        dropDatabase($conn, $_POST["dbName"]);
        if (!hasDatabase($conn, $_POST["dbName"])) {
            $rc = createDatabase($conn, $_POST["dbName"]);
            $data["message"] .= '\nCreating database `' . $_POST["dbName"] . "`.";
        } else {
            $data["message"] .= '\nDatabase `' . $_POST["dbName"] . "` already exists.";
        }
        $data["message"] .= '\nConnection success.';
    } catch (PDOException $e) {
        $data["ok"] = false;
        $data["error"] = "Connection failed with error." . $e->getMessage();
    }
    die(json_encode($data));
}

// query
if ($op == "query") {
    if (!isset($_POST["host"]) || !isset($_POST["user"]) || !isset($_POST["password"]) || !isset($_POST["dbName"]) || !isset($_POST["query"])) {
        $data["ok"] = false;
        $data["error"] = "Specify the query.";
        die(json_encode($data));
    }
    try {
        $conn = new PDO('mysql:host=' . $_POST["host"] . ";dbname=" . $_POST["dbName"], $_POST["user"], $_POST["password"]);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $data["ok"] = true;
        $data["message"] = "The query is successfully executed!";
        $data["data"] = executeQuery($conn, $_POST["query"]);
        die(json_encode($data));
    } catch (PDOException $e) {
        $data["ok"] = false;
        $data["error"] = $e->getMessage();
        die(json_encode($data));
    }
}
