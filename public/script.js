function getSong() {

    let songTitle = document.getElementById('songTitleTextField').value.trim()
    console.log('songTitle: ' + songTitle)

    if(songTitle === '') {
        return alert('Please enter a Song Title')
    }

    let searchResultsBody = document.getElementById('searchResultsBody');
    searchResultsBody.innerHTML = ''; // Clear previous results

    let xhr = new XMLHttpRequest()
    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4 && xhr.status == 200) {
          let response = JSON.parse(xhr.responseText);

           // Filter results to include only those where title includes exact search term
          let filteredResults = response.results.filter(song => 
            song.trackName.toLowerCase().includes(songTitle.toLowerCase())
          );

          if (filteredResults.length === 0) {
            searchResultsBody.innerHTML = `<h2 style="color: red;">No matching songs found for "${songTitle}"</h2>`;
            return;
          }
          
          searchResultsBody.innerHTML = `<h1>Songs matching: ${songTitle}</h1>`;

          filteredResults.forEach(song => {
              let row = document.createElement('tr');

              let actionsCell = document.createElement('td');
              let addButton = document.createElement('button');
              addButton.textContent = '➕';
              addButton.classList.add('add-btn');
              addButton.addEventListener('click', () => addSongToPlaylist({
                title: song.trackName,
                artist: song.artistName,
                artworkUrl: song.artworkUrl100
              }));

              actionsCell.appendChild(addButton);

              let titleCell = document.createElement('td');
              titleCell.textContent = song.trackName;

              let artistCell = document.createElement('td');
              artistCell.textContent = song.artistName;

              let artworkCell = document.createElement('td');
              let img = document.createElement('img');
              img.src = song.artworkUrl100;
              artworkCell.appendChild(img);

              row.appendChild(actionsCell);
              row.appendChild(titleCell);
              row.appendChild(artistCell);
              row.appendChild(artworkCell);

              searchResultsBody.appendChild(row);
          });
      }
  };
    xhr.open('GET', `/songs?title=${songTitle}`, true)
    xhr.send()
}

document.addEventListener('DOMContentLoaded', () => {
  const searchButton = document.getElementById('submit_button');
  searchButton.addEventListener('click', () => {
      console.log("Search button clicked!");
      getSong();
  });
});

function addSongToPlaylist(song) {
  const { title, artist, artworkUrl } = song;

  fetch(`/playlist/add?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}&artworkUrl=${encodeURIComponent(artworkUrl)}`)
    .then(response => response.text())
    .then(data => {
      alert("🎶 Added to playlist!");
      console.log(data);
    })
    .catch(error => {
      console.error("Error adding song to playlist:", error);
    });
}

