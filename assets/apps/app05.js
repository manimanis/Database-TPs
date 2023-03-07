function randint(a, b) {
  return Math.floor(a + Math.random() * (b - a + 1));
}

class Query {
  constructor(obj= {}) {
    this.ctrl = obj.ctrl || 'textarea';
    this.numRows = obj.numRows || 1;
    this.correct = obj.correct || "";
    this.user = obj.user || "";
    this.answer = obj.answer || "";
    this.data = obj.data || {};
    this.execCount = obj.execCount || 0,
    this.showAns = !!obj.showAns;
    this.success = !!obj.success;
  }
};

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
    connectQuery: new Query(),
    connectionSuccess: false,
    connectionMsg: '',
    numTP: 0,
    dbName: '',
    minExecCount: 5,
    isConnected: false,
    allQuestions: [],
  },
  mounted: function () {
    this.loadConnectionSettings();
    // this.loadAnswers();
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
      //window.localStorage.setItem("userQueries" + this.numTP, JSON.stringify(this.userQueries));
    },
    loadAnswers: function () {
      //this.userQueries = JSON.parse(window.localStorage.getItem("userQueries" + this.numTP)) || [];
    },
    resetAnswers: function () {
      //this.userQueries = this.allLi.map(li => li.userQuery);
      this.saveAnswers();
    },
    loadCorrectAnswers: function () {
      //this.userQueries = this.allLi.map(li => li.correctQuery);
      this.saveAnswers();
    },
    resetAnswersClicked: function () {
      if (confirm("Voulez-vous supprimer toutes vos réponses ?")) {
        this.resetAnswers();
      }
    },
    prepareQuestions: function () {
      this.allQuestionsDivs = [...document.querySelectorAll("#questions > .question")];
      this.allQuestions = this.allQuestionsDivs.map((div, idxDiv) => {
        const description = div.querySelector(".description")?.innerHTML;
        const queries = [...div.querySelectorAll(".query")].map(query => {
          const ctrl = query.dataset['typecontrol'];
          const numRows = query.dataset['rows'];
          const correct =  query.querySelector('.correct')?.textContent;
          const user = query.querySelector('.user')?.textContent;
          return new Query({
            ctrl,
            numRows,
            correct, 
            user,
            answer: user,
            data: null,
            execCount: 0,
            showAns: false,
            success: false
          });
        });
        return {
          description,
          queries
        };
      });
    },
    toFormData: function (obj) {
      const data = new FormData();
      for (let key of Object.keys(obj)) {
        data.append(key, obj[key]);
      }
      return data;
    },
    sendQuery: function (queryObj, dataObj) {
      queryObj.success = false;
      queryObj.execCount++;
      // this.saveAnswers();
      return fetch("query.php", {
        method: "post",
        headers: {
          'Accept': 'application/json'
        },
        body: this.toFormData(dataObj)
      })
        .then(response => response.json())
        .then(data => {
          queryObj.data = data;
          queryObj.success = data.ok;
          if (data.ok) {
            queryObj.data["message"] = data["message"].replace(/\\n/g, '<br>');
          }
          this.$forceUpdate();
          return data;
        });
    },
    connectToServer: function () {
      const data = { ...this.connectionSettings };
      data["op"] = "connect";
      this.isConnected = false;
      this.sendQuery(this.connectQuery, data)
        .then(data => {
          if (data.ok) {
            this.saveConnectionSettings();
            this.isConnected = true;
          }
        });
    },
    executeQuery: function (queryObj) {
      const data = { ...this.connectionSettings };
      data["op"] = "query";
      data["query"] = queryObj.answer;
      this.sendQuery(queryObj, data)
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
    showChallenge: function (idx, count) {
      const challenges = [
        { op: '+', range: [1000, 9999] },
        { op: '-', range: [1000, 9999] },
        { op: '*', range: [1, 999] }
      ];
      const choice = randint(0, challenges.length - 1);
      const a = randint(challenges[choice].range[0], challenges[choice].range[1]);
      const b = randint(challenges[choice].range[0], challenges[choice].range[1]);
      const op = challenges[choice].op;
      const res = eval(`${a} ${op} ${b}`);
      const choices = Array(4).fill(0).map(_ => {
        const a = randint(challenges[choice].range[0], challenges[choice].range[1]);
        const b = randint(challenges[choice].range[0], challenges[choice].range[1]);
        return eval(`${a} ${op} ${b}`);
      });
      choices[randint(0, 3)] = res;
      const msg = `Question ${idx+1}/${count}\nCombien font ${a} ${op} ${b}?\n${choices.join("\n")}`;
      const ans = prompt(msg, '0');
      return (ans == res);
    },
    showChallenges: function () {
      return Array(2).fill(false).map((_, idx) => this.showChallenge(idx, 2)).every(ans => ans);
    },
    showAnswerClicked: function (queryObj) {
      if (!this.showChallenges()) {
        alert("Non, c'est faux!");
        return;
      }
      queryObj.showAns = true;
      this.$forceUpdate();
      setTimeout(() => {
        //const block = document.getElementById("query-answer-" + queryObj);
        //hljs.highlightElement(block);
      }, 10);
    },
    pasteAnswerClicked: function (queryObj) {
      queryObj.answer = queryObj.correct;
      this.$forceUpdate();
    },
    nextQuestion: function () {
      this.currQuestion = this.currQuestion + 1;
      this.showQuestions(this.currQuestion);
    },
    hasData: function (queryObj) {
      return (queryObj.success && queryObj.data && queryObj.data.data && Array.isArray(queryObj.data.data) && queryObj.data.data.length > 0);
    },
    getColumns: function (queryObj) {
      return Object.keys(queryObj.data.data[0]);
    },
    getAllRows: function (queryObj) {
      return queryObj.data.data;
    }
  }
});