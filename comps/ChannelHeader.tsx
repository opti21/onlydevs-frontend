import { useWindupString } from "windups";
export default function ChannelHeader(props) {
  const { member } = props;
  const [description] = useWindupString(member.description);
  const [displayName] = useWindupString(member.display_name);
  return (
    <div className='w-full h-1/4'>
      <div id='image-div'>
        <div className='float-left mr-3'>
          <img
            className='w-8 md:w-20 rounded-md'
            src={member.profile_image_url}
            alt={member.login + "'s profile picture"}
          />
        </div>
        <h2 className='text-2xl font-bold md:pt-4 md:text-4xl text-white mb-4'>
          {displayName}
        </h2>
        <div className='h-1/4 text-white md:pt-3 whitespace-normal'>
          {description === "" ? "No description" : description}
        </div>
      </div>
    </div>
  );
}
