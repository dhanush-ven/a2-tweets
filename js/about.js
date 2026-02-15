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
    
    function setTextClass(className, text) {
        const el = document.getElementsByClassName(className)[0];
        if (el) el.innerText = text;
    }
    function setTextClasspt2(className, text) {
        const el = document.getElementsByClassName(className)[1];
        if (el) el.innerText = text;
    }

    // Total tweets
    setText('numberTweets', tweet_array.length);

    /* ======================
       Earliest & Latest Dates
       ====================== */
    if (tweet_array.length > 0) {
        const times = tweet_array.map(t => t.time); // timestamps for min/max
        const earliest = new Date(Math.min(...times));
        // const earliest = Math.min(...times)
        console.log(typeof(earliest))

        const latest = new Date(Math.max(...times));
        // const latest = Math.max(...times);
        console.log(typeof(latest))

        console.log(earliest.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
        console.log(latest.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))

        setText('firstDate', earliest.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
        setText('lastDate', latest.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
        
    }


    /* ======================
       Tweet Categories
       ====================== */
    const total = tweet_array.length || 1; // prevent division by zero
    console.log("total tweets: " + total)
    setTextClass('numberTweets',total)
    
    const completed = tweet_array.filter(t => t.source === 'completed_event').length;
    console.log("total completed: " + completed)
    setTextClass('completedEvents',completed)
    setTextClasspt2('completedEvents',completed)
    
    const live = tweet_array.filter(t => t.source === 'live_event').length;
    console.log("total live tweets: " + live)
    setTextClass('liveEvents',live)
    
    const achievement = tweet_array.filter(t => t.source === 'achievement').length;
    console.log("total achievement tweets: " + achievement)
    setTextClass('achievements',achievement)
    
    const misc = tweet_array.filter(t => t.source === 'miscellaneous').length;
    console.log("total misc tweets: " + misc)
    setTextClass('miscellaneous',misc)

    setTextClass('completedEventsPct', ((completed / total) * 100).toFixed(2) + '%');
    setTextClass('liveEventsPct', ((live / total) * 100).toFixed(2) + '%');
    setTextClass('achievementsPct', ((achievement / total) * 100).toFixed(2) + '%');
    setTextClass('miscellaneousPct', ((misc / total) * 100).toFixed(2) + '%');
    // setTextClass('writtenPct',());

    /* ======================
       User-written Tweets
       ====================== */
    const completedTweets = tweet_array.filter(t => t.source === 'completed_event');
    if (completedTweets.length > 0) {
        const writtenCompleted = completedTweets.filter(t => t.written).length;
        setTextClass('writtenPct', ((writtenCompleted / completedTweets.length) * 100).toFixed(2) + '%');
        setTextClass('written', writtenCompleted);
    }
    
}

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function () {
    loadSavedRunkeeperTweets().then(parseTweets);
});
