DROP DATABASE notes;

CREATE DATABASE notes;

USE notes;

CREATE TABLE IF NOT EXISTS notes (
  ideleve INT NOT NULL,
  trim INT NOT NULL,
  idmat INT NOT NULL,
  idex INT NOT NULL,
  note DOUBLE NOT NULL DEFAULT 0 CHECK(note >= 0 AND note <= 20),
  coef DOUBLE NOT NULL DEFAULT 1 CHECK(coef > 0),
  PRIMARY KEY (ideleve, trim, idmat, idex)
);

INSERT INTO notes VALUES (1,1,1,1,0.5,1), 
    (1,1,1,2,13.75,2), 
    (1,2,1,1,4.5,1),
    (1,2,1,2,0.75,2),
    (2,1,1,1,10,1),
    (2,1,1,2,19.5,2),
    (2,2,1,1,19,1),
    (2,2,1,2,1,2),
    (3,2,1,2,13,2);

--1
SELECT COUNT(*) FROM notes;

--2
SELECT COUNT(DISTINCT ideleve) AS nbr_eleves FROM notes;

--3
SELECT MIN(note) AS mn, MAX(note) AS mx
FROM notes;

--4
SELECT AVG(note) as moyenne
FROM notes
WHERE trim = 1 AND ideleve = 1;

--5
SELECT COUNT(note) AS nbr_notes
FROM notes
WHERE note >= 10;

--6
SELECT COUNT(note) AS nbr_notes
FROM notes
WHERE note BETWEEN 8 AND 10;

--7
SELECT SUM(coef) AS som_coef
FROM notes
WHERE ideleve = 1 AND trim = 1;

--8
SELECT SUM(note * coef) AS somme
FROM notes
WHERE ideleve = 1 AND trim = 1;

--9
SELECT SUM(note * coef) / SUM(coef) AS moyenne
FROM notes
WHERE ideleve = 1 AND trim = 1;
