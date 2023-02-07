const dbName = 'location_vehicules';
const queries = [
  '-- connect',
  `CREATE DATABASE ${dbName};`,
  '-- question théorique',
  `CREATE TABLE vehicules (
  matricule VARCHAR(10) PRIMARY KEY NOT NULL,
  ...
);`,
  `CREATE TABLE clients (
  cin VARCHAR(10) PRIMARY KEY,
  ...
);`,
`CREATE TABLE locations (
  num_location INT PRIMARY KEY AUTO_INCREMENT,
  ...,
  CONSTRAINT fk_location_1 FOREIGN KEY (matricule)
      REFERENCES vehicules (matricule)
      ON UPDATE CASCADE 
      ON DELETE CASCADE,
  CONSTRAINT fk_location_2 FOREIGN KEY (cin)
      REFERENCES clients (cin)
      ON UPDATE CASCADE 
      ON DELETE CASCADE);`
];
const tp02 = new Vue({
  el: '#main',
  data: {
    queries: queries,
    currentQuestion: 0,
    host: '127.0.0.1',
    user: 'root',
    password: '',
    isConnected: false,
    connectMsg: queries.map(q => ""),
    isSuccessful: queries.map(q => false),
    dbName: dbName
  },
  mounted: function () {
    this.loadConnectionParams();
  },
  methods: {
    loadConnectionParams: function () {
      const defaultConn = {
        host: '127.0.0.1',
        user: 'root',
        password: ''
      };
      const conn = JSON.parse(window.localStorage.getItem("mysql_connect")) || defaultConn;
      this.host = conn.host;
      this.user = conn.user;
      this.password = conn.password;
    },
    saveConnectionParams: function () {
      window.localStorage.setItem("mysql_connect", JSON.stringify({
        host: this.host,
        user: this.user,
        password: this.password
      }));
    },
    toFormData: function (obj) {
      const data = new FormData();
      for (let key of Object.keys(obj)) {
        data.append(key, obj[key]);
      }
      return data;
    },
    connectToServer: function () {
      let data = {
        op: 'connect',
        host: this.host,
        user: this.user,
        password: this.password
      };
      this.isSuccessful[0] = false;
      fetch("query.php", {
        method: "post",
        headers: {
          'Accept': 'application/json'
        },
        body: this.toFormData(data)
      })
        .then(response => response.json())
        .then(data => {
          if (data["ok"] == false) {
            this.connectMsg[0] = data["error"];
          } else {
            this.isSuccessful[0] = true;
            this.connectMsg[0] = data["data"]
            this.saveConnectionParams();
            this.currentQuestion = 1;
          }
        });
    },
    createDatabase: function () {
      let data = {
        op: 'create_db',
        host: this.host,
        user: this.user,
        password: this.password,
        dbName: this.dbName
      };
      this.isSuccessful[1] = false;
      fetch("query.php", {
        method: "post",
        headers: {
          'Accept': 'application/json'
        },
        body: this.toFormData(data)
      })
        .then(response => response.json())
        .then(data => {
          if (data["ok"] == false) {
            this.connectMsg[1] = data["error"];
          } else {
            this.isSuccessful[1] = true;
            this.connectMsg[1] = data["data"]
            this.currentQuestion = 2;
          }
        });
    },
    nextQuestion: function (numQuestion) {
      this.currentQuestion = numQuestion;
    },
    executeQuery: function (numQuery) {
      let data = {
        op: 'query',
        host: this.host,
        user: this.user,
        password: this.password,
        dbName: this.dbName,
        query: this.queries[numQuery]
      };
      this.isSuccessful[numQuery] = false;
      fetch("query.php", {
        method: "post",
        headers: {
          'Accept': 'application/json'
        },
        body: this.toFormData(data)
      })
        .then(response => response.json())
        .then(data => {
          if (data["ok"] == false) {
            this.connectMsg[numQuery] = data["error"];
          } else {
            this.isSuccessful[numQuery] = true;
            this.connectMsg[numQuery] = data["data"]
          }
          this.$forceUpdate();
        });
    }
  }
});
