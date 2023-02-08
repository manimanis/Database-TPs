const app = new Vue({
  el: '#main',
  data: {
    connectionSettings: {
      host: '127.0.0.1',
      user: 'root',
      password: 'mysqlroot',
      dbName: 'location_vehicules',
      dropAndCreateDatabase: true
    },
    minExecCount: 10,
    isConnected: false,
    allLi: [],
    currQuestion: 0,
    executionCount: [],
    msg: [],
    isSuccess: [],
    data: [],
    queries: [],
    userQueries: []
  },
  mounted: function () {
    this.prepareQuestions();
  },
  methods: {
    prepareQuestions: function () {
      this.allLi = [...document.querySelectorAll('#questions > li')];
      this.allLi = this.allLi.map(li => {
        const question = li.querySelector('.question')?.innerHTML;
        const query = li.querySelector('.query');
        const correctQuery = li.querySelector('.correctQuery')?.textContent;
        const userQuery = li.querySelector('.userQuery')?.textContent;
        const hasQuery = query != null;
        const queryParams = [];
        if (hasQuery) {
          queryParams['type'] = query.dataset.typecontrol;
          queryParams['rows'] = query.dataset.rows;
          queryParams['numQuery'] = +query.dataset.numquery;
          if (correctQuery) {
            this.queries[queryParams['numQuery']] = correctQuery;
          }
          if (userQuery) {
            this.userQueries[queryParams['numQuery']] = userQuery;
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
          console.log(data);
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
    nextQuestion: function () {
      this.currQuestion = this.currQuestion + 1;
      this.showQuestions(this.currQuestion);
    }
  }
});