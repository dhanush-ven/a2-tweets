function parseTweets(runkeeper_tweets) {
    // Do not proceed if no tweets loaded
    if (!runkeeper_tweets) {
        window.alert('No tweets returned');
        return;
    }

    // Create Tweet objects
    const tweet_array = runkeeper_tweets.map(tweet => new Tweet(tweet.text, tweet.created_at));

    // Helper function to safely set innerText
    function setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.innerText = text;
    }

    // Total tweets
    setText('numberTweets', tweet_array.length);

    /* ======================
       Earliest & Latest Dates
       ====================== */
    if (tweet_array.length > 0) {
        const times = tweet_array.map(t => t.time.getTime()); // timestamps for min/max
        const earliest = new Date(Math.min(...times));
        const latest = new Date(Math.max(...times));

        setText('earliestDate', earliest.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
        setText('latestDate', latest.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    }

    /* ======================
       Tweet Categories
       ====================== */
    const total = tweet_array.length || 1; // prevent division by zero
    const completed = tweet_array.filter(t => t.source === 'completed_event').length;
    const live = tweet_array.filter(t => t.source === 'live_event').length;
    const achievement = tweet_array.filter(t => t.source === 'achievement').length;
    const misc = tweet_array.filter(t => t.source === 'miscellaneous').length;

    setText('completedPercent', ((completed / total) * 100).toFixed(2));
    setText('livePercent', ((live / total) * 100).toFixed(2));
    setText('achievementPercent', ((achievement / total) * 100).toFixed(2));
    setText('miscPercent', ((misc / total) * 100).toFixed(2));

    /* ======================
       User-written Tweets
       ====================== */
    const completedTweets = tweet_array.filter(t => t.source === 'completed_event');
    if (completedTweets.length > 0) {
        const writtenCompleted = completedTweets.filter(t => t.written).length;
        setText('writtenPercent', ((writtenCompleted / completedTweets.length) * 100).toFixed(2));
    }
}

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function () {
    loadSavedRunkeeperTweets().then(parseTweets);
});
