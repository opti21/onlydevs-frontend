import { connectToDatabase } from "../../util/mongodb_backend";
import dayjs from "dayjs";

class Member {
  id: number;
  username?: string;
}
const initTeam: Member[] = [
  {
    id: 167160215,
    // username: 'theprimeagen',
  },
  {
    id: 509382535,
    // username: 'melkeydev',
  },
  {
    id: 424038378,
    // username: 'beginbot',
  },
  {
    id: 192497221,
    // username: 'erikdotdev',
  },
  {
    id: 32985385,
    // username: 'roxkstar74',
  },
  {
    id: 114257969,
    // username: 'teej_dv',
  },
  {
    id: 278217731,
    // username: 'mastermndio',
  },
  {
    id: 264030156,
    // username: 'thealtf4stream',
  },
  {
    id: 43065048,
    // username: 'bun9000',
  },
  {
    id: 73184979,
    // username: 'simpathey',
  },
  {
    id: 369724,
    // username: 'opti_21'
  },
];

async function getToken() {
  const { db } = await connectToDatabase();

  const currentToken = await db.collection("twitch creds").find().toArray();

  if (currentToken.length > 0) {
    const tokenExpired = dayjs().isAfter(dayjs(currentToken.expire_date));
    if (tokenExpired) {
      console.log("Token expired, fetching new token");
      const newTokenResponse = await fetch(
        `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT}&client_secret=${process.env.TWITCH_SECRET}&grant_type=client_credentials`,
        {
          method: "POST",
        }
      ).then((response) => {
        return response.json();
      });

      // Delete old token document
      await db
        .collection("twitch creds")
        .findOneAndDelete({ _id: currentToken._id })
        .then((res) => {
          console.log("Old token deleted");
        })
        .catch((err) => {
          console.error(err);
          return;
        });

      // Create new token document
      await db
        .collection("twitch creds")
        .insertOne({
          ...newTokenResponse,
          expire_date: dayjs()
            .add(newTokenResponse.expires_in, "seconds")
            .format(),
        })
        .catch((err) => {
          console.error(err);
          return;
        });

      return newTokenResponse;
    } else {
      console.log("Using existing token");
      return currentToken[0];
    }
  } else {
    console.log("Token doesn't exist, creating new token");
    const newTokenResponse = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT}&client_secret=${process.env.TWITCH_SECRET}&grant_type=client_credentials`,
      {
        method: "POST",
      }
    ).then((response) => {
      return response.json();
    });

    // Create new token document
    await db
      .collection("twitch creds")
      .insertOne({
        ...newTokenResponse,
        expire_date: dayjs()
          .add(newTokenResponse.expires_in, "seconds")
          .format(),
      })
      .catch((err) => {
        console.error(err);
        return;
      });

    return newTokenResponse;
  }
}

export default async (req, res) => {
  let twitchToken = await getToken();

  let userQuery = "";

  for (let i = 0; i < initTeam.length; i++) {
    if (i === 0) {
      userQuery += `?id=${initTeam[i].id}`;
    } else {
      userQuery += `&id=${initTeam[i].id}`;
    }
  }

  const usersReposnse = await fetch(
    `https://api.twitch.tv/helix/users${userQuery}`,
    {
      headers: {
        Authorization: "Bearer " + twitchToken.access_token,
        "Client-ID": process.env.TWITCH_CLIENT,
      },
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      res.status(500).json(err);
    });

  let TEAM = usersReposnse.data;

  let streamQuery = "";

  for (let i = 0; i < initTeam.length; i++) {
    if (i === 0) {
      streamQuery += `?user_id=${initTeam[i].id}`;
    } else {
      streamQuery += `&user_id=${initTeam[i].id}`;
    }
  }

  const streamReposnse = await fetch(
    `https://api.twitch.tv/helix/streams${streamQuery}`,
    {
      headers: {
        Authorization: "Bearer " + twitchToken.access_token,
        "Client-ID": process.env.TWITCH_CLIENT,
      },
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      res.status(500).json(err);
    });

  // console.log(streamReposnse)

  let teamData: object[] = [];

  for (let i = 0; i < TEAM.length; i++) {
    let streamData = streamReposnse.data;
    let live;

    if (streamData.length > 0) {
      // At least someone is live
      streamData.forEach((channel) => {
        if (TEAM[i].id === channel.user_id || live) {
          live = true;
        } else {
          live = false;
        }
      });
    } else {
      // No one is live, imagine not streaming, cringe.
      live = false;
    }

    teamData.push({
      ...TEAM[i],
      is_live: live,
    });
  }

  res.status(200).json(teamData);
};
