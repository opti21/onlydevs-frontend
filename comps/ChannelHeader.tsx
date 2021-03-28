import { useWindupString } from "windups";
export default function ChannelHeader(props) {
  const { member } = props;
  const [description] = useWindupString(member.description);
  return (
    <div className='w-full'>
      <div id='image-div'>
        <div className='float-left mr-3'>
          <img
            className='w-14 rounded-md'
            src={member.profile_image_url}
            alt={member.login + "'s profile picture"}
          />
        </div>
        <p className='text-white'>{description}</p>
      </div>
    </div>
  );
}
