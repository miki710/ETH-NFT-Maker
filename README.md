# ETH-NFT-Maker

このプロジェクトは、UNCHAINプロジェクトのETH-NFT-Makerを参考に作成されたNFT作成アプリケーションです。

## プロジェクト概要

- **フレームワーク**: Next.js（create-next-appで作成）
- **パッケージマネージャ**: pnpm
- **Web3ライブラリ**: wagmi
- **ストレージ**: Pinata（web3Storageの代替として使用）
- **スマートコントラクト**: Remix IDEでデプロイ（Hardhatは未使用）

## 特徴

- wagmiを使用したWeb3機能の実装
- PinataへのNFTメタデータと画像のアップロード
- ディレクトリ構造やwagmiの使用方法の参考例

## 開発背景

このプロジェクトは、将来の開発の参考とするために作成されました。特に、以下の点に焦点を当てています：

- Next.jsプロジェクトの構造
- wagmiライブラリの効果的な使用方法
- Web3アプリケーションの基本的な構築方法

## 注意点

- このプロジェクトはHardhatを使用せず、Remix IDEでスマートコントラクトをデプロイしています。ABIファイルのみをプロジェクトに含めています。
- create-next-appでワークスペースを追加してモノレポにする方法が不明なため、単一のNext.jsプロジェクトとして構築されています。

## セットアップ

1. リポジトリをクローン
2. 依存関係をインストール: `pnpm install`
3. 環境変数を設定（`.env.local`ファイルを作成）
4. 開発サーバーを起動: `pnpm dev`

## 使用技術

- Next.js
- React
- TypeScript
- wagmi
- Pinata API

## 今後の展望

- Hardhatの統合
- モノレポ構造への移行
- テストの追加

