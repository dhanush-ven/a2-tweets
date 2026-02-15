class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {
        //TODO: identify whether the source is a live event, an achievement, a completed event, or miscellaneous.
        // const lower = this.text.toLowerCase();
		const lower = this.text;

		if (lower.startsWith("Just completed")|| lower.startsWith("Completed") || lower.startsWith("Just posted") ) {
			return "completed_event";
		}
		// You wanna be careful with words that are like "I'm or some vague words"
		if (lower.includes("#RKLive") ) {
			return "live_event";
		}
		if (lower.includes("Achieved")|| lower.includes("#FitnessAlerts")) {
			return "achievement";
		}
		return "miscellaneous";
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written():boolean {
        //TODO: identify whether the tweet is written
        if (this.source !== "completed_event") {
			return false;
		}

		return !this.text.includes("with @Runkeeper");

		// let cleaned = this.text;

		// // remove hashtag and link
		// cleaned = cleaned.replace("#RunKeeper", "");
		// cleaned = cleaned.replace(/https:\/\/t\.co\/\S+/, "");

		// // remove default RunKeeper sentence
		// cleaned = cleaned.replace(/Just completed a .* with RunKeeper\./i, "");

		// return cleaned.trim().length > 0;;
    }

    get writtenText():string {
        if (!this.written) {
			return "";
		}

		let cleaned = this.text;
		cleaned = cleaned.replace("#RunKeeper", "");
		cleaned = cleaned.replace(/https:\/\/t\.co\/\S+/, "");
		cleaned = cleaned.replace(/Just completed a .* with RunKeeper\./i, "");

		return cleaned.trim();
    }

    get activityType():string {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        //TODO: parse the activity type from the text of the tweet
        const lower = this.text.toLowerCase();

		// find the distance unit
		const miIndex = lower.indexOf(" mi ");
		const kmIndex = lower.indexOf(" km ");

		let start = -1;
		if (miIndex !== -1) {
			start = miIndex + 4;
		} else if (kmIndex !== -1) {
			start = kmIndex + 4;
		}

		if (start === -1) {
			return "unknown";
		}

		const end = lower.indexOf(" with runkeeper");
		if (end === -1) {
			return "unknown";
		}

		return lower.substring(start, end).trim();
    }

    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        //TODO: prase the distance from the text of the tweet
        const lower = this.text.toLowerCase();

		const miMatch = lower.match(/([\d.]+)\smi/);
		if (miMatch) {
			return parseFloat(miMatch[1]);
		}

		const kmMatch = lower.match(/([\d.]+)\skm/);
		if (kmMatch) {
			const km = parseFloat(kmMatch[1]);
			return km / 1.609;
		}

		return 0;
    }

    getHTMLTableRow(rowNumber:number):string {
        //TODO: return a table row which summarizes the tweet with a clickable link to the RunKeeper activity
        const linkMatch = this.text.match(/https:\/\/t\.co\/\S+/);
		const link = linkMatch ? linkMatch[0] : "#";

		return `
			<tr>
				<td>${rowNumber}</td>
				<td>${this.activityType}</td>
				<td><a href="${link}" target="_blank">View</a></td>
			</tr>
		`;
    }
}