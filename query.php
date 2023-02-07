<?php
$op = "";
$method = $_SERVER['REQUEST_METHOD'];
$data = ["ok" => true, "method" => $method, "data" => []];

$data["data"][] = $_POST;

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

// Connect
if ($op == "connect") {
    if (!isset($_POST["host"]) || !isset($_POST["user"]) || !isset($_POST["password"])) {
        $data["ok"] = false;
        $data["error"] = "Specify host, user and password.";
        die(json_encode($data));
    }
    try {
        $conn = new PDO('mysql:host=' . $_POST["host"], $_POST["user"], $_POST["password"]);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        if ($conn) {
            $data["ok"] = true;
            $data["data"] = "Connected to the database server successfully!";
            die(json_encode($data));
        }
    } catch (PDOException $e) {
        $data["ok"] = false;
        $data["error"] = $e->getMessage();
        die(json_encode($data));
    }
}

// create_db
if ($op == "create_db") {
    if (!isset($_POST["host"]) || !isset($_POST["user"]) || !isset($_POST["password"]) || !isset($_POST["dbName"])) {
        $data["ok"] = false;
        $data["error"] = "Specify DB Name.";
        die(json_encode($data));
    }
    try {
        $conn = new PDO('mysql:host=' . $_POST["host"], $_POST["user"], $_POST["password"]);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        if ($conn) {
            if ($conn->exec("CREATE DATABASE IF NOT EXISTS " . $_POST['dbName'] . ";") === false) {
                $data["ok"] = false;
                $data["data"] = "Failed to create the " . $_POST["dbName"] . " database!";
                die(json_encode($data));
            }
            $data["ok"] = true;
            $data["data"] = "The database " . $_POST["dbName"] . " is successfully created!";
            die(json_encode($data));
        }
    } catch (PDOException $e) {
        $data["ok"] = false;
        $data["error"] = $e->getMessage();
        die(json_encode($data));
    }
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
        if ($conn) {
            if ($conn->query($_POST["query"]) === false) {
                $data["ok"] = false;
                $data["data"] = "Failed to create the " . $_POST["dbName"] . " database!";
                die(json_encode($data));
            }
            $data["ok"] = true;
            $data["data"] = "The query is successfully executed!";
            die(json_encode($data));
        }
    } catch (PDOException $e) {
        $data["ok"] = false;
        $data["error"] = $e->getMessage();
        die(json_encode($data));
    }
}
