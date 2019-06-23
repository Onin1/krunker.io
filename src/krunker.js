const Api = require("./api.js");
const { encode, decode } =  require('msgpack-lite');

class Krunker extends Api
{
    GetProfile(username)
    {
        this.connect();

        return new Promise((resolve, reject) =>
        {
            this.socket.onopen = () =>
            {
                const data = encode([ 'r', [ 'profile', username, '', null ] ]);
                this.socket.send(data.buffer);
            }

            this.socket.onmessage = buff =>
            {
                const data = decode(new Uint8Array(buff.data))[1][2];
                this.disconnect();

                if (!data)
                    return reject(new Error("User not found!"));

                const profile_info =
                {
                    name: data.player_name,
                    id: data.player_id,
                    score: data.player_score,
                    level: this.GetLevel(data),
                    kills: data.player_kills,
                    deaths: data.player_deaths,
                    kdr: this.GetKDR(data),
                    spk: this.GetSPK(data),
                    totalGamesPlayed: data.player_games_played,
                    wins: data.player_wins,
                    loses: data.player_games_played - data.player_wins,
                    wl: this.GetWL(data),
                    playTime: this.GetPlayTime(data),
                    funds: data.player_funds,
                    clan: data.player_clan ? data.player_clan : 'No Clan',
                    featured: data.player_featured ? "Yes" : 'No',
                    hacker: data.player_hack ? "Positive" : 'Negative'
                };

                resolve(profile_info);
            }
        });
    }

    GetLevel(data)
    {
        const score = data.player_score;
        return Math.max(1, Math.floor(0.03 * Math.sqrt(score)));
    }

    GetPlayTime(data)
    {
        const time = data.player_timeplayed;
        let timeplayed = "";

        const min = Math.floor(Math.floor(time / 1000) / 60) % 60;
		const hour = Math.floor(Math.floor(Math.floor(time / 1000) / 60) / 60) % 24;
		const day = Math.floor(Math.floor(Math.floor(Math.floor(time / 1000) / 60) / 60) / 24);

        if (day) timeplayed  += `${day}d `;
        if (hour) timeplayed += `${hour}h `;
        if (min) timeplayed  += `${min}m`;
        return timeplayed;
    }

    GetKDR(data)
    {
		const KDR = data.player_kills / data.player_deaths || 0;
		return KDR.toFixed(2);
    }

    GetWL(data)
    {
		const WL = data.player_wins / data.player_games_played || 0;
		return WL.toFixed(2);
	}

    GetSPK(data)
    {
		const SPK = data.player_score / data.player_kills || 0;
		return SPK.toFixed(2);
    }


}

module.exports = Krunker;
