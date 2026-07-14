import biddzDeal from '@/assets/projects/biddz/screenshots/01-deal-and-dashboard.jpg';
import biddzLive from '@/assets/projects/biddz/screenshots/02-live-deals.jpg';
import biddzPurchase from '@/assets/projects/biddz/screenshots/03-purchase-flow.jpg';
import biddzHome from '@/assets/projects/biddz/screenshots/04-home-and-event.png';
import happyCard from '@/assets/projects/happy/app-store-card.png';
import happyWidget from '@/assets/projects/happy/source-previews/widget.png';
import machtblickToday from '@/assets/projects/machtblick/screenshots/01-heute.png';
import machtblickMember from '@/assets/projects/machtblick/screenshots/02-abgeordneten.png';
import machtblickMotion from '@/assets/projects/machtblick/screenshots/03-antrag-argument.png';
import machtblickParties from '@/assets/projects/machtblick/screenshots/04-parteien.png';
import memesBuilder from '@/assets/projects/memes-ai/screenshots/01.png';
import memesPrompt from '@/assets/projects/memes-ai/screenshots/02.png';
import memesLoading from '@/assets/projects/memes-ai/screenshots/03.png';
import piassoChat from '@/assets/projects/piasso/screenshots/01.webp';
import piassoArt from '@/assets/projects/piasso/screenshots/02.webp';
import piassoHistory from '@/assets/projects/piasso/screenshots/03.webp';
import piassoEdit from '@/assets/projects/piasso/screenshots/04.webp';
import piassoShare from '@/assets/projects/piasso/screenshots/05.webp';

export default {
  machtblick: [
    { name: 'today.png', caption: "Today's Bundestag decisions", src: machtblickToday },
    { name: 'member-profile.png', caption: 'Member attendance and voting record', src: machtblickMember },
    { name: 'motion-arguments.png', caption: 'Motion details and arguments', src: machtblickMotion },
    { name: 'party-comparison.png', caption: 'Party comparison', src: machtblickParties },
  ],
  biddz: [
    { name: 'deal-dashboard.jpg', caption: 'Song deal and earnings dashboard', src: biddzDeal },
    { name: 'live-deals.jpg', caption: 'Live and upcoming music deals', src: biddzLive },
    { name: 'purchase-flow.jpg', caption: 'biddzShare purchase flow', src: biddzPurchase },
    { name: 'home-and-event.png', caption: 'Home and artist event views', src: biddzHome },
  ],
  piasso: [
    { name: 'chat-assistant.webp', caption: 'AI writing assistant', src: piassoChat },
    { name: 'ai-art.webp', caption: 'Natural-language image generation', src: piassoArt },
    { name: 'chat-history.webp', caption: 'Saved conversation history', src: piassoHistory },
    { name: 'image-editing.webp', caption: 'Natural-language image editing', src: piassoEdit },
    { name: 'sharing.webp', caption: 'Sharing generated artwork', src: piassoShare },
  ],
  'memes ai': [
    { name: 'meme-builder.png', caption: 'Meme builder and style picker', src: memesBuilder },
    { name: 'prompt-anything.png', caption: 'Open-ended meme prompting', src: memesPrompt },
    { name: 'generating.png', caption: 'Meme generation in progress', src: memesLoading },
  ],
  happy: [
    { name: 'app-store-card.png', caption: 'Happy App Store artwork', src: happyCard },
    { name: 'birthday-widget.png', caption: 'Birthday widget on the Home Screen', src: happyWidget },
  ],
};
