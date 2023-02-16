const app = new Vue({
  el: '#main',
  data: {
    connectionSettings: {
      host: '127.0.0.1',
      user: 'root',
      password: '',
      dbName: 'bookshelf',
      dropAndCreateDatabase: false
    },
    numTP: 0,
    dbName: '',
    minExecCount: 5,
    isConnected: false,
    allLi: [],
    currQuestion: 0,
    executionCount: [],
    msg: [],
    showAnswer: [],
    isSuccess: [],
    data: [],
    queries: [],
    userQueries: []
  },
  mounted: function () {
    this.loadConnectionSettings();
    this.loadAnswers();
    this.prepareQuestions();
    const url = new URL(window.location);
    if (url.search.indexOf("correctAnswers") != -1) {
      console.log("Correct answers loaded.");
      this.loadCorrectAnswers();
    }
  },
  methods: {
    saveConnectionSettings: function () {
      window.localStorage.setItem("mysqlConnection" + this.numTP, JSON.stringify(this.connectionSettings));
    },
    loadConnectionSettings: function () {
      const connectionParams = document.querySelector(".connection-params");
      this.dbName = connectionParams.dataset['base'];
      this.numTp = +connectionParams.dataset['numTp'];
      const defaultSettings = {
        host: '127.0.0.1',
        user: 'root',
        password: '',
        dbName: this.dbName,
        dropAndCreateDatabase: false
      };
      this.connectionSettings = JSON.parse(window.localStorage.getItem("mysqlConnection" + this.numTP)) || defaultSettings;
      this.connectionSettings.dbName = this.dbName;
    },
    saveAnswers: function () {
      window.localStorage.setItem("userQueries" + this.numTP, JSON.stringify(this.userQueries));
    },
    loadAnswers: function () {
      this.userQueries = JSON.parse(window.localStorage.getItem("userQueries" + this.numTP)) || [];
    },
    resetAnswers: function () {
      this.userQueries = this.allLi.map(li => li.userQuery);
      this.saveAnswers();
    },
    loadCorrectAnswers: function () {
      this.userQueries = this.allLi.map(li => li.correctQuery);
      this.saveAnswers();
    },
    resetAnswersClicked: function () {
      if (confirm("Voulez-vous supprimer toutes vos réponses ?")) {
        this.resetAnswers();
      }
    },
    prepareQuestions: function () {
      this.allLi = [...document.querySelectorAll('#questions > li')];
      this.allLi = this.allLi.map((li, idx) => {
        const question = li.querySelector('.question')?.innerHTML;
        const query = li.querySelector('.query');
        const correctQuery = li.querySelector('.correctQuery')?.textContent;
        const userQuery = li.querySelector('.userQuery')?.textContent;
        const hasQuery = query != null;
        const queryParams = [];
        if (hasQuery) {
          queryParams['type'] = query.dataset.typecontrol;
          queryParams['rows'] = query.dataset.rows;
          queryParams['numQuery'] = idx;
          if (correctQuery) {
            this.queries[queryParams['numQuery']] = correctQuery;
          }
          if (userQuery) {
            this.userQueries[queryParams['numQuery']] = this.userQueries[queryParams['numQuery']] || userQuery;
          }
        }
        return {
          question: question,
          hasQuery: hasQuery,
          queryParams: queryParams,
          correctQuery: correctQuery,
          userQuery: userQuery
        };
      });
      this.data = this.queries.map(_ => []);
      this.msg = Array(this.allLi.length).fill("");
      this.isSuccess = Array(this.allLi.length).fill(false);
      this.executionCount = Array(this.queries.length).fill(0);
      this.showAnswer = Array(this.queries.length).fill(false);
    },
    toFormData: function (obj) {
      const data = new FormData();
      for (let key of Object.keys(obj)) {
        data.append(key, obj[key]);
      }
      return data;
    },
    sendQuery: function (numQuery, obj) {
      this.isSuccess[numQuery] = false;
      this.executionCount[numQuery]++;
      this.saveAnswers();
      return fetch("query.php", {
        method: "post",
        headers: {
          'Accept': 'application/json'
        },
        body: this.toFormData(obj)
      })
        .then(response => response.json())
        .then(data => {
          if (data.ok == false) {
            this.msg[numQuery] = data.error;
          } else {
            this.isSuccess[numQuery] = true;
            this.msg[numQuery] = data["message"].replace(/\\n/g, '<br>');
          }
          this.data[numQuery] = data["data"];
          this.$forceUpdate();
          return data;
        });
    },
    connectToServer: function (numQuery) {
      const data = { ...this.connectionSettings };
      data["op"] = "connect";
      this.isConnected = false;
      this.sendQuery(numQuery, data)
        .then(data => {
          if (data.ok) {
            this.saveConnectionSettings();
            this.isConnected = true;
          }
        });
    },
    executeQuery: function (numQuery) {
      const data = { ...this.connectionSettings };
      data["op"] = "query";
      data["query"] = this.userQueries[numQuery];
      this.sendQuery(numQuery, data)
        .then(data => {
          // console.log(data);
        });
    },
    showQuestions: function (numQuestion) {
      this.allLi.forEach((li, idx) => {
        if (idx <= numQuestion) {
          li.classList.remove("d-none");
        } else {
          li.classList.add("d-none");
        }
      });
    },
    showAnswerClicked: function (numQuery) {
      this.showAnswer[numQuery] = true;
      this.$forceUpdate();
      setTimeout(() => {
        const block = document.getElementById("query-answer-" + numQuery);
        hljs.highlightElement(block);
      }, 10);
    },
    pasteAnswerClicked: function (numQuery) {
      this.userQueries[numQuery] = this.queries[numQuery];
      this.$forceUpdate();
    },
    nextQuestion: function () {
      this.currQuestion = this.currQuestion + 1;
      this.showQuestions(this.currQuestion);
    }
  }
});