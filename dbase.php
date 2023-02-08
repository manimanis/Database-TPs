<?php
function show_databases(PDO $conn) {
    $st = $conn->query("SHOW DATABASES;");
    return $st->fetchAll(PDO::FETCH_ASSOC);
}

function hasDatabase(PDO $conn, string $dbName) {
    $dbs = show_databases($conn);
    foreach ($dbs as $row) {
        if ($row["Database"] == $dbName) {
            return true;
        }
    }
    return false;
}

function dropDatabase(PDO $conn, string $dbName) {
    $st = $conn->query("DROP DATABASE IF EXISTS $dbName;");
    return $st->rowCount();
}

function createDatabase(PDO $conn, string $dbName) {
    $st = $conn->query("CREATE DATABASE $dbName;");
    return $st->rowCount();
}

function executeQuery(PDO $conn, string $query) {
    $st = $conn->query($query);
    return $st->fetchAll(PDO::FETCH_ASSOC);
}