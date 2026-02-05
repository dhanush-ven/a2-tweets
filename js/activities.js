function parseTweets(runkeeper_tweets) {
    // Do not proceed if no tweets loaded
    if (runkeeper_tweets === undefined) {
        window.alert('No tweets returned');
        return;
    }

    // Create Tweet objects
    const tweet_array = runkeeper_tweets.map(tweet => new Tweet(tweet.text, tweet.created_at));

    // Filter only completed tweets
    const completedTweets = tweet_array.filter(t => t.source === 'completed_event');

    // ===============================
    // 1️⃣ Count tweets per activity
    // ===============================
    const activityCounts = {};
    completedTweets.forEach(t => {
        const type = t.activityType || "Unknown";
        activityCounts[type] = (activityCounts[type] || 0) + 1;
    });

    const activityData = Object.keys(activityCounts).map(key => ({
        activity: key,
        count: activityCounts[key]
    }));

    // ===============================
    // 2️⃣ Bar chart: number of tweets per activity
    // ===============================
    const activity_vis_spec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "A graph of the number of Tweets containing each type of activity.",
        "data": { "values": activityData },
        "mark": "bar",
        "encoding": {
            "x": { "field": "activity", "type": "ordinal", "title": "Activity Type" },
            "y": { "field": "count", "type": "quantitative", "title": "Number of Tweets" },
            "color": { "field": "activity", "type": "nominal", "legend": null }
        }
    };
    vegaEmbed('#activityVis', activity_vis_spec, { actions: false });

    // ===============================
    // 3️⃣ Prepare distance vs day-of-week data for top 3 activities
    // ===============================
    const topActivities = Object.entries(activityCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(e => e[0]);

    const distanceData = completedTweets
        .filter(t => topActivities.includes(t.activityType))
        .map(t => ({
            activity: t.activityType,
            distance: t.distance,
            day: t.time.toLocaleDateString(undefined, { weekday: 'long' })
        }));

    // ===============================
    // 4️⃣ Scatter plot
    // ===============================
    const scatter_spec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Distances by day of the week for top 3 activities",
        "data": { "values": distanceData },
        "mark": "point",
        "encoding": {
            "x": { "field": "day", "type": "ordinal", "title": "Day of Week" },
            "y": { "field": "distance", "type": "quantitative", "title": "Distance (mi)" },
            "color": { "field": "activity", "type": "nominal", "title": "Activity" }
        }
    };

    // ===============================
    // 5️⃣ Aggregate mean distance per day
    // ===============================
    const aggregated_spec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Mean distance by day of the week for top 3 activities",
        "data": { "values": distanceData },
        "mark": "line",
        "encoding": {
            "x": { "field": "day", "type": "ordinal", "title": "Day of Week" },
            "y": { "aggregate": "mean", "field": "distance", "type": "quantitative", "title": "Average Distance (mi)" },
            "color": { "field": "activity", "type": "nominal", "title": "Activity" }
        }
    };

    // ===============================
    // 6️⃣ Toggle button for scatter/aggregate
    // ===============================
    let showingAggregate = false;

    function renderGraph() {
        if (showingAggregate) {
            vegaEmbed('#distanceVis', aggregated_spec, { actions: false });
        } else {
            vegaEmbed('#distanceVis', scatter_spec, { actions: false });
        }
    }

    document.getElementById('aggregate').addEventListener('click', () => {
        showingAggregate = !showingAggregate;
        renderGraph();
    });

    // Render initial graph
    renderGraph();
}

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
    loadSavedRunkeeperTweets().then(parseTweets);
});
