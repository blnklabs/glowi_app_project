import { Page, Navbar, Block } from 'framework7-react';

export default function HomePage() {
  return (
    <Page>
      <Navbar title="Home" />
      <Block>
        <h1 className="text-xl font-semibold mb-2">Home</h1>
        <p className="text-gray-600">Main dashboard. Add your primary CTA and content previews here.</p>
      </Block>

      {/* Primary CTA Button */}
      <div className="px-4 mt-8">
        <button
          className="w-full py-4 bg-[#007AFF] text-white text-[17px] font-semibold rounded-[14px] active:opacity-80"
        >
          Next
        </button>
      </div>
    </Page>
  );
}
