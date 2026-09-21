import FixedNav from "@/components/navigation/FixedNav";
import Toast from "@/components/ui/Toast";
import KakaoFab from "@/components/ui/KakaoFab";
import Opening from "@/components/sections/Opening";
import Story from "@/components/sections/Story";
import Invitation from "@/components/sections/Invitation";
import Wedding from "@/components/sections/Wedding";
import Venue from "@/components/sections/Venue";
import Gallery from "@/components/sections/Gallery";
import Account from "@/components/sections/Account";
import Guestbook from "@/components/sections/Guestbook";
import PhotoShare from "@/components/sections/PhotoShare";

export default function Home() {
  return (
    <>
      <FixedNav />
      <main>
        <Opening />
        <Story />
        <Invitation />
        <Wedding />
        <Venue />
        <Gallery />
        <Account />
        <Guestbook />
        <PhotoShare />
      </main>
      <Toast />
      <KakaoFab />
    </>
  );
}
