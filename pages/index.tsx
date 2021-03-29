import { GetStaticProps } from "next";
import Head from "next/head";
import { useState } from "react";
import { TwitchEmbed } from "react-twitch-embed";
import { useWindupString, WindupChildren } from "windups";
import Channel from "../comps/Channel";
import ChannelHeader from "../comps/ChannelHeader";
import useSWR from "swr";
import MobileMenu from "../comps/MobileMenu";
const fetcher = (url) => fetch(url).then((r) => r.json());

export default function Home(props) {
  const { data, error } = useSWR("/api/team-data", fetcher, {
    initialData: props.teamData,
  });
  console.log(data);
  const [channel, setChannel] = useState("");
  const [member, setMember] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
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
        className='container mx-auto max-w-6xl bg-black bg-repeat p-1 md:p-3'
        style={{ backgroundImage: "url(/archbtw.png)" }}
      >
        {/* Header */}
        <div className='header text-white'>
          <div className='pb-5'>
            <div className='text-7xl font-mono'>{title}</div>
          </div>
        </div>
        <MobileMenu data={data} setChannel={setChannel} setMember={setMember} />
        <div className='flex mx-auto bg-none mt-6'>
          {/* Side Menu */}
          <div className='flex-col hidden md:block'>
            <div className='side-menu w-52 h-auto flex-none overflow-y-scroll-auto bg-gray-700 bg-opacity-50 text-white font-mono  divide-y-2 divide-gray-600'>
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
            <div className='p-3'>
              <button className='rounded-md text-white h-15 w-full bg-indigo-500 p-3 mb-4'>
                <a href='https://discord.gg/YTe4hQGdKh'>Join our Discord</a>
              </button>
            </div>
          </div>

          {/* Right Side */}
          <div className='chanel-content flex-1'>
            {member ? (
              <>
                <div className='bg-gray-700 bg-opacity-50 p-3 md:ml-4 mb-4'>
                  <ChannelHeader member={member} />
                </div>
                <div className='h-auto bg-gray-700 bg-opacity-50 p-3 md:ml-4 md:mb-4'>
                  <TwitchEmbed
                    channel={channel}
                    theme='dark'
                    width='100%'
                    height='600px'
                    parent={[
                      "onlydevs.tv",
                      "localhost",
                      "onlydevs-frontend.vercel.app",
                    ]}
                  />
                </div>
              </>
            ) : (
              <>
                <div className='bg-gray-700 bg-opacity-50 p-3 md:ml-4 mb-4'>
                  <h1 className='text-4xl font-mono text-white'>
                    <WindupChildren>
                      {"Select a channel to watch"}
                    </WindupChildren>
                  </h1>
                </div>
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
