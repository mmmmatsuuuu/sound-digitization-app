# ビルドと実行のためのベースイメージとして公式のNode.jsイメージを使用
FROM node:latest

# コンテナ内の作業ディレクトリを設定
WORKDIR /app

# Viteの開発サーバーがリッスンするポートを公開
EXPOSE 5173