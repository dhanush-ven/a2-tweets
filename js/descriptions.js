function parseTweets(runkeeper_tweets) {
    if (!runkeeper_tweets) {
        window.alert('No tweets returned');
        return;
    }

    // Create Tweet objects
    const tweet_array = runkeeper_tweets.map(tweet => new Tweet(tweet.text, tweet.created_at));

    // Get DOM elements
    const searchBox = document.getElementById('textFilter');
    const searchCount = document.getElementById('searchCount');
    const searchText = document.getElementById('searchText');
    const tableBody = document.getElementById('tweetTable');

    // Safety check
    if (!searchBox || !searchCount || !searchText || !tableBody) {
        console.error('One or more required DOM elements are missing!');
        return;
    }

    function updateTable() {
        const query = searchBox.value.trim().toLowerCase();
        searchText.innerText = query || '???';

        // Filter only user-written tweets
        const results = tweet_array.filter(t => t.written && t.writtenText.toLowerCase().includes(query));

        // Populate table
        tableBody.innerHTML = results.map((t, i) => t.getHTMLTableRow(i + 1)).join('');

        // Update count
        searchCount.innerText = results.length;
    }

    // Listen for every keystroke
    searchBox.addEventListener('input', updateTable);

    // Optionally, populate table with all tweets initially
    updateTable();
}

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function () {
    loadSavedRunkeeperTweets().then(parseTweets);
});

