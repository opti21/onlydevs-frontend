export default function Channel(props) {
  const { member, style, setChannel, setMember, setShowMenu } = props;

  return (
    <div
      className={style}
      key={member.id}
      onClick={() => {
        setChannel(member.login);
        setMember(member);
        if (setShowMenu) {
          setShowMenu(false);
        }
      }}
    >
      <a href='#' className='h-full'>
        <div className='float-left pr-3'>
          <img
            className='w-8 rounded-md'
            src={member.profile_image_url}
            alt={member.login + "'s profile picture"}
          />
        </div>
        <div className='pt-0.5'>{member.display_name}</div>
      </a>
    </div>
  );
}
