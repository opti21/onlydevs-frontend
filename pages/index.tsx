import { GetStaticProps } from "next";
import Head from "next/head";
import { useState } from "react";
import { TwitchPlayer } from "react-twitch-embed";
import { useWindupString, WindupChildren } from "windups";
import Channel from "../comps/Channel";
import ChannelHeader from "../comps/ChannelHeader";
import useSWR from "swr";
const fetcher = (url) => fetch(url).then((r) => r.json());

export default function Home(props) {
  const { data, error } = useSWR("/api/team-data", fetcher, {
    initialData: props.teamData,
  });
  console.log(data);
  const [channel, setChannel] = useState("");
  const [member, setMember] = useState(false);
  let liveStyle =
    "p-3 border-t-1 bg-red-500 animate-pulse hover:bg-gray-600 hover:bg-opactity-25";
  let notLiveStyle = "p-3 border-t-1 hover:bg-gray-600 hover:bg-opactity-25";
  const [title] = useWindupString("OnlyDevs");
  return (
    <>
      <Head>
        <title>OnlyDevs</title>
      </Head>
      <body
        className='container mx-auto max-w-6xl bg-black bg-repeat p-3'
        style={{ backgroundImage: "url(/archbtw.png)" }}
      >
        {/* Header */}
        <div className='header text-white'>
          <div className='pb-5'>
            <div className='text-7xl font-mono '>{title}</div>
          </div>
        </div>

        <div className='grid grid-rows-4 grid-flow-col gap-4 max-w-6xl mx-auto bg-none'>
          {/* Side Menu */}
          <div className='side-menu w-52 row-span-4 overflow-y-auto bg-gray-700 bg-opacity-50 text-white font-mono  divide-y-2 divide-gray-600'>
            {data ? (
              <>
                <div className='divide-y-2 divide-gray-600'>
                  {data.map((member) => {
                    if (member.is_live) {
                      return (
                        <Channel
                          member={member}
                          style={liveStyle}
                          setChannel={setChannel}
                          setMember={setMember}
                        />
                      );
                    }
                  })}
                </div>
                <div className='divide-y-2 divide-gray-600'>
                  {data.map((member) => {
                    if (!member.is_live) {
                      return (
                        <Channel
                          member={member}
                          style={notLiveStyle}
                          setChannel={setChannel}
                          setMember={setMember}
                        />
                      );
                    }
                  })}
                </div>
              </>
            ) : (
              <>Loading...</>
            )}
          </div>

          <div className='bg-gray-700 bg-opacity-50 col-span-5 p-3'>
            {member === false ? <> </> : <ChannelHeader member={member} />}
          </div>
          {/* Stream Embed */}
          <div className='bg-gray-700 bg-opacity-50 row-span-3 col-span-5 p-3'>
            {channel === "" ? (
              <div className='text-white'>Please select a channel</div>
            ) : (
              <>
                <TwitchPlayer
                  channel={channel}
                  theme='dark'
                  width='100%'
                  height='100%'
                  muted={true}
                />
              </>
            )}
          </div>
        </div>
      </body>
    </>
  );
}

// export const getStaticProps: GetStaticProps = async (context) => {
// const teamData = await fetcher('http://localhost:3000/api/team-data')

//   return {
//     props: {
//       initialChannel: "theprimeagen",
//       teamData: teamData
//     }
//   }
// }
