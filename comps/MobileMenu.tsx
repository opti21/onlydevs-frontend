import { useState } from "react";
import Channel from "./Channel";

export default function MobileMenu(props) {
  const { data, setChannel, setMember } = props;
  const [showMenu, setShowMenu] = useState(true);

  const toggleMenu = () => {
    setShowMenu((showMenu) => !showMenu);
  };

  const liveStyle =
    "p-3 border-t-1 bg-red-500 animate-pulse hover:bg-gray-600 hover:bg-opactity-25";
  const notLiveStyle = "p-3 border-t-1 hover:bg-gray-600 hover:bg-opactity-25";

  return (
    <>
      <div className='mobile-menu md:hidden'>
        <button className='rounded-md text-white w-full bg-indigo-500 p-2 mb-4'>
          <a href='https://discord.gg/YTe4hQGdKh'>Join our Discord</a>
        </button>
        <button
          onClick={toggleMenu}
          className='bg-white w-full rounded-md p-2 mb-3'
        >
          Channel Menu
        </button>
        {showMenu ? (
          <div className='w-full h-auto flex-none overflow-y-scroll-auto bg-gray-700 bg-opacity-50 text-white font-mono  divide-y-2 divide-gray-600'>
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
                          setShowMenu={toggleMenu}
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
                          setShowMenu={toggleMenu}
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
        ) : (
          <></>
        )}
      </div>
    </>
  );
}
