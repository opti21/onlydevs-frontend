import { connectToDatabase } from "../../util/mongodb_backend";
import dayjs from "dayjs";
import { Member, TwitchUser } from "../../types";

const teamUsersFallback: Member[] = [
  {
    user_id: 167160215,
    // username: 'theprimeagen',
  },
  {
    user_id: 509382535,
    // username: 'melkeydev',
  },
  {
    user_id: 424038378,
    // username: 'beginbot',
  },
  {
    user_id: 192497221,
    // username: 'erikdotdev',
  },
  {
    user_id: 32985385,
    // username: 'roxkstar74',
  },
  {
    user_id: 114257969,
    // username: 'teej_dv',
  },
  {
    user_id: 278217731,
    // username: 'mastermndio',
  },
  {
    user_id: 264030156,
    // username: 'thealtf4stream',
  },
  {
    user_id: 43065048,
    // username: 'bun9000',
  },
  {
    user_id: 73184979,
    // username: 'simpathey',
  },
  {
    user_id: 476845395,
    // username: 'bashbunni'
  },
];

async function getToken() {
  const { db } = await connectToDatabase();

  const currentToken = await db.collection("twitch creds").find().toArray();

  if (currentToken.length > 0) {
    const tokenExpired = dayjs().isAfter(dayjs(currentToken[0].expire_date));
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
        .findOneAndDelete({ _id: currentToken[0]._id })
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
  let teamUsers;

  const teamResponse = await fetch(
    `https://api.twitch.tv/helix/teams?name=onlydevs`,
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
    .then((data) => {
      console.log("Using api data");
      teamUsers = data.data[0].users;
    })
    .catch((err) => {
      console.log("using fallback");
      teamUsers = teamUsersFallback;
      console.error(err);
    });

  let userQuery = "";

  for (let i = 0; i < teamUsers.length; i++) {
    if (i === 0) {
      userQuery += `?id=${teamUsers[i].user_id}`;
    } else {
      userQuery += `&id=${teamUsers[i].user_id}`;
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

  for (let i = 0; i < teamUsers.length; i++) {
    if (i === 0) {
      streamQuery += `?user_id=${teamUsers[i].user_id}`;
    } else {
      streamQuery += `&user_id=${teamUsers[i].user_id}`;
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

  let unsortedTeamData: TwitchUser[] = [];

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

    unsortedTeamData.push({
      ...TEAM[i],
      is_live: live,
    });
  }

  const teamData = unsortedTeamData.sort((a, b) => {
    if (a.login < b.login) {
      return -1;
    }

    if (a.login > b.login) {
      return 1;
    }

    return 0;
  });
  // console.log(teamData);

  res.status(200).json(teamData);
};
