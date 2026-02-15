function parseTweets(runkeeper_tweets) {
    // Stop if no tweets loaded
    if (!runkeeper_tweets || runkeeper_tweets.length === 0) {
        window.alert('No tweets returned');
        return;
    }

    // Create Tweet objects
    const tweetArray = runkeeper_tweets.map(
        tweet => new Tweet(tweet.text, tweet.created_at)
    );

    // Keep only completed activities
    const completedTweets = tweetArray.filter(
        t => t.source === 'completed_event'
    );

    // ===============================
    // 1️⃣ Count tweets per activity
    // ===============================
    const activityCounts = {};
    completedTweets.forEach(t => {
        const type = t.activityType || 'Unknown';
        activityCounts[type] = (activityCounts[type] || 0) + 1;
    });

    const activityData = Object.keys(activityCounts).map(activity => ({
        activity: activity,
        count: activityCounts[activity]
    }));

    // ===============================
    // 2️⃣ Update text on the page
    // ===============================
    const sortedActivities = Object.entries(activityCounts)
        .sort((a, b) => b[1] - a[1]);

    const numberActivitiesEl = document.getElementById('numberActivities');
    const firstMostEl = document.getElementById('firstMost');
    const secondMostEl = document.getElementById('secondMost');
    const thirdMostEl = document.getElementById('thirdMost');

    if (numberActivitiesEl) {
        numberActivitiesEl.textContent = sortedActivities.length;
    }
    if (firstMostEl && sortedActivities[0]) {
        firstMostEl.textContent = sortedActivities[0][0];
    }
    if (secondMostEl && sortedActivities[1]) {
        secondMostEl.textContent = sortedActivities[1][0];
    }
    if (thirdMostEl && sortedActivities[2]) {
        thirdMostEl.textContent = sortedActivities[2][0];
    }

    // ===============================
    // 3️⃣ Activity bar chart
    // ===============================
    const activityVisSpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Number of tweets per activity type",
        "data": { "values": activityData },
        "mark": "bar",
        "encoding": {
            "x": { "field": "activity", "type": "ordinal", "title": "Activity Type" },
            "y": { "field": "count", "type": "quantitative", "title": "Number of Tweets" },
            "color": { "field": "activity", "type": "nominal", "legend": null }
        }
    };

    vegaEmbed('#activityVis', activityVisSpec, { actions: false });

    // ===============================
    // 4️⃣ Top 3 activities
    // ===============================
    const topActivities = sortedActivities
        .slice(0, 3)
        .map(entry => entry[0]);

    const distanceData = completedTweets
        .filter(t => topActivities.includes(t.activityType))
        .map(t => ({
            activity: t.activityType,
            distance: t.distance,
            day: t.time.toLocaleDateString(undefined, { weekday: 'long' })
        }));

    // ===============================
    // 5️⃣ Longest / shortest activity text
    // ===============================
    const averageDistances = {};
    distanceData.forEach(d => {
        if (!averageDistances[d.activity]) {
            averageDistances[d.activity] = [];
        }
        averageDistances[d.activity].push(d.distance);
    });

    const averages = Object.entries(averageDistances).map(([activity, distances]) => ({
        activity,
        avg: distances.reduce((a, b) => a + b, 0) / distances.length
    }));

    averages.sort((a, b) => b.avg - a.avg);

    const longestEl = document.getElementById('longestActivityType');
    const shortestEl = document.getElementById('shortestActivityType');

    if (longestEl && averages[0]) {
        longestEl.textContent = averages[0].activity;
    }
    if (shortestEl && averages[averages.length - 1]) {
        shortestEl.textContent = averages[averages.length - 1].activity;
    }

    // ===============================
    // 6️⃣ Weekday vs Weekend
    // ===============================
    const weekendDays = ['Saturday', 'Sunday'];
    const weekendDistances = distanceData.filter(d => weekendDays.includes(d.day));
    const weekdayDistances = distanceData.filter(d => !weekendDays.includes(d.day));

    const weekendAvg = weekendDistances.length
        ? weekendDistances.reduce((sum, d) => sum + d.distance, 0) / weekendDistances.length
        : 0;

    const weekdayAvg = weekdayDistances.length
        ? weekdayDistances.reduce((sum, d) => sum + d.distance, 0) / weekdayDistances.length
        : 0;

    const weekdayOrWeekendEl = document.getElementById('weekdayOrWeekendLonger');
    if (weekdayOrWeekendEl) {
        weekdayOrWeekendEl.textContent =
            weekendAvg > weekdayAvg ? 'weekends' : 'weekdays';
    }

    // ===============================
    // 7️⃣ Scatter & aggregated graphs
    // ===============================
    const scatterSpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Distances by day of the week",
        "data": { "values": distanceData },
        "mark": "point",
        "encoding": {
            "x": { "field": "day", "type": "ordinal", "title": "Day of Week" },
            "y": { "field": "distance", "type": "quantitative", "title": "Distance (mi)" },
            "color": { "field": "activity", "type": "nominal" }
        }
    };

    const aggregatedSpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Mean distance by day of week",
        "data": { "values": distanceData },
        "mark": "line",
        "encoding": {
            "x": { "field": "day", "type": "ordinal", "title": "Day of Week" },
            "y": {
                "aggregate": "mean",
                "field": "distance",
                "type": "quantitative",
                "title": "Average Distance (mi)"
            },
            "color": { "field": "activity", "type": "nominal" }
        }
    };

    let showingAggregate = false;

    function renderGraph() {
        vegaEmbed(
            '#distanceVis',
            showingAggregate ? aggregatedSpec : scatterSpec,
            { actions: false }
        );
    }

    const button = document.getElementById('aggregate');
    if (button) {
        button.addEventListener('click', () => {
            showingAggregate = !showingAggregate;
            renderGraph();
        });
    }

    renderGraph();
}

// Load data after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    loadSavedRunkeeperTweets().then(parseTweets);
});