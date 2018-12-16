const search = document.querySelector("button");
const name = document.querySelector("#username"); //
const image = document.querySelector("#image"); //
const repo = document.querySelector(".container1");
const followers = document.querySelector(".container2");
const following = document.querySelector(".container3");
const listRepo = document.querySelector(".container4");
const languages = document.querySelector(".container5");
const commits = document.querySelector(".container6");

const baseURL = "https://api.github.com";
const paramOne =
  "\x65\x37\x63\x34\x30\x33\x34\x36\x38\x31\x65\x33\x30\x62\x34\x35\x30\x38\x32\x31\x31\x30\x39\x63\x63\x61\x66\x35\x33\x32\x35\x61\x31\x36\x36\x36\x38\x36\x64\x34";
// Security through obscurity (obfuscation)
const params = `?access_token=${paramOne}`;

const httpMethod = {
  method: "GET"
};

function displayData(data) {
  followers.innerHTML = `<p> Followers ${data.followers}  </p>`;
  following.innerHTML = `<p> Following ${data.following}  </p>`;
  name.innerHTML = `<p> ${data.login} </p> `;
  image.setAttribute("src", data.avatar_url);
  image.style.display = "block";

  const username = getUsername();
  const url = baseURL + "/users/" + username + "/repos" + params;

  fetch(url, httpMethod)
    .then(r => r.json())
    .then(data => {
      const number = data.length;
      repo.innerHTML = `<p> Repositories ${number} </p> `;
      const list = data.map(repo => {
        return `
            <tr id="${repo.name}">
                <td><p>${repo.name}</p></td>
                <td><p>${repo.description}</p></td>
                <td><p>${repo.forks_count}</p></td>
                <td><p>${repo.stargazers_count}</p></td>
            </tr>
        `;
      });
      listRepo.innerHTML = `
        <table id="myTable">
            <thead>
                <td>Name</td>
                <td>Description</td>
                <td>Forks</td>
                <td>Stars</td>
            </thead>
            ${list.join("")}
        </table>
      `;
      $("#myTable").DataTable();
      // Event Delegation
      //   If we just selected tr, only the trs on the first page would have events
      //   When we add an event to the table, it will always be on the page
      //   When a click event takes place, check to see if the element that was clicked was actually the tr
      //   If it was, call the callback function
      // The reasons we do this:
      //   The table is always on the page (so even for new elements, the event will work)
      //   For performance: Instead of adding events to every tr, we just add it to the one table
      $("#myTable").on("click", "tr", function(event) {
        const repoName = event.currentTarget.getAttribute("id");
        const username = getUsername();
        displayChart(repoName, username);
      });
    });
}

function displayChart(repoName, username) {
  if (!repoName || !username) {
    return false;
  }
  const url = `${baseURL}/repos/${username}/${repoName}`;
  const urlL = `${url}/languages${params}`;
  fetch(urlL)
    .then(resp => resp.json())
    .then(function(data) {
      languages.innerHTML = `<canvas id="myChart"></canvas>`;
      let line = document.querySelector("#myChart").getContext("2d");
      let chr = new Chart(line, {
        type: "line",
        data: {
          labels: Object.keys(data),
          datasets: [
            {
              label: "Used Languages  ",
              backgroundColor: "rgb(236, 236, 249)",
              data: Object.values(data)
            }
          ]
        }
      });
    });
  const urlC = `${url}/commits${params}`;
  fetch(urlC)
    .then(resp => resp.json())
    .then(function(data) {
      const listCommits = data.map(commit => {
        const date = formatDate(commit.commit.committer.date);
        const timeSinceEpoch = new Date(commit.commit.committer.date).valueOf();
        // The number of seconds since January 1, 1970 (since the epoch)
        return `
          <tr>
              <td>${commit.commit.message}</td>
              <td>${commit.commit.author.name}</td>
              <td data-order="${timeSinceEpoch}">${date}</td>
          </tr>
      `;
      });
      commits.innerHTML = `
        <table id="commitTable">
            <thead>
                <td>Message</td>
                <td>Author</td>
                <td>Date</td>
            </thead>
            ${listCommits.join("")}
        </table>
      `;
      const table = $("#commitTable").DataTable();
      table.order([2, "desc"]).draw();
    });
}

function getUsername() {
  let username = document.querySelector("input").value;
  if (username === "") {
    username = "jquery";
  }
  return username;
}

function getUser() {
  const username = getUsername();
  const url = baseURL + "/users/" + username + params;
  fetch(url, httpMethod)
    .then(resp => resp.json())
    .then(displayData);
}

search.addEventListener("click", function(event) {
  event.preventDefault();
  getUser();
});

getUser();

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
