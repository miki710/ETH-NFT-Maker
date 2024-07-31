import React from "react";

const NftUploaderLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <header>
        <h1>NFT Uploader</h1>
      </header>
      <main>{children}</main>
      <footer>
        <p>Footer content here</p>
      </footer>
    </div>
  );
};

export default NftUploaderLayout;