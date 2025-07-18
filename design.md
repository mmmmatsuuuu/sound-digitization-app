# ウェブアプリ設計：音声波形エディタ (MUI、10秒制限、ラジオボタン選択)

---

### 1. アプリケーションの目的とユーザー (変更なし)

- **目的**: マイクから録音した音声を波形で視覚化し、サンプリング周波数や量子化ビット数を変更することで音の変化を体験・学習できる、シンプルで直感的なウェブアプリケーション。
- **ターゲットユーザー**: 高校生 (Chromebookユーザーを想定)
- **UXの目標**: 直感的、視覚的、高速なフィードバック、シンプルな操作。

---

### 2. 主要機能の設計 (調整点含む)

### 2.1. マイクからの音声取り込み (録音)

- **UI要素**:
    - MUIの`Button`コンポーネントを使用し、録音開始/停止ボタンを実装。
    - 録音状態インジケーター（MUIの`CircularProgress`またはカスタムCSSアニメーション）。
    - 録音時間表示（**最大5秒で自動停止**）。
    - 録音レベルメーター（MUIの`LinearProgress`などで視覚化）。
- **技術**:
    - `navigator.mediaDevices.getUserMedia({ audio: true })` でマイクストリームを取得。
    - `AudioContext`と`ScriptProcessorNode`（または`AudioWorkletNode`）を組み合わせて**最大5秒間**の音声データを`AudioBuffer`に蓄積。
    - 録音データは、**元の高音質データとして保持**（後述の「元の波形の保持」に関連）。

### 2.2. 波形表示と操作

- **UI要素**:
    - MUIの`Paper`コンポーネントなどで波形表示エリアを囲み、視覚的に分かりやすくする。
    - **メイン波形表示エリア (Canvas)**: 録音された音声の波形を表示。
    - **ミニマップ/全体波形表示 (Canvas)**: 全体の波形と、メイン表示エリアの現在の位置・選択範囲を示す。
    - ズーム/スクロールは、初期段階では簡易的なボタン操作（MUIの`IconButton`など）にとどめ、後日実装を検討。
- **技術**:
    - `HTML5 Canvas`を使用し、`requestAnimationFrame`で描画。
    - 波形描画は**選択されたサンプリング周波数と量子化ビット数**に即座に反映される。この描画データは、元の波形データから「見た目」だけを加工したもので、`utils/canvasUtils.js`で処理。

### 2.3. サンプリング周波数と量子化ビット数の表示・変更

- **UI要素**:
    - MUIの`RadioGroup`と`FormControlLabel`、`Radio`コンポーネントを使用。
    - **サンプリング周波数選択ラジオボタン**:
        - 例: 「元の音質」「半分の音質」「1/4の音質」など、**分かりやすい選択肢**を提供する。内部的には具体的なHz値を紐付ける（例: 44.1kHz, 22.05kHz, 11.025kHz）。
          - 44.1kHz
          - 22.05kHz
          - 16kHz
          - 8kHz
          - 4kHz
          - 2kHz
    - **量子化ビット数選択ラジオボタン**:
        - 例: 「元の滑らかさ」「粗い音質 (16bit)」「もっと粗い音質 (8bit)」など、こちらも直感的な選択肢にする。内部的にはビット数を紐付ける。
          - 16bit
          - 12bit
          - 8bit
          - 4bit
          - 2bit
    - 各ラジオボタンの横に、そのパラメーターが音にどう影響するかを簡潔に説明。
    - **データ量理論値表示 (新規UI要素)**:
        - **現在の設定に基づくデータ量表示**: サンプリング周波数、量子化ビット数、および**録音時間**から計算されたデータ量の理論値（例: 「約 X MB」）を表示する専用のテキストエリアまたはセクションを設けます。
        - 表示は、サンプリング周波数または量子化ビット数のラジオボタンが変更されるたびに**リアルタイムで更新**されます。
- **技術**:
    - 選択された値はReactのステートで管理し、UIにバインド。
    - **波形表示への即時反映**: ラジオボタンが選択されるたびに、**元の波形データ**から、選択されたサンプリング周波数と量子化ビット数に対応する**描画用のデータ**を`utils/canvasUtils.js`または`utils/audioUtils.js`内のヘルパー関数で生成し、Canvasを再描画。これにより、視覚的なフィードバックを高速化。
    - **将来の連続値変更への対応**: ラジオボタンで選ばれる値は、内部的には具体的な数値（例: `sampleRate: 22050`, `bitDepth: 8`）として扱うことで、将来スライダーに切り替える際にもロジックの大きな変更が不要になるように設計する。
    - **データ量計算ロジック**: `utils/audioUtils.js` に以下の計算を行う関数を追加します。
        - モノラル音声の場合:
        textデータ量(bits)=textサンプリング周波数(Hz)timestext量子化ビット数(bits)timestext時間(秒)textデータ量(Bytes)=fractextデータ量(bits)8textデータ量(MB)=fractextデータ量(Bytes)1024times1024
        - ステレオ音声の場合（Web Audio APIのマイク入力は通常モノラルですが、将来的な拡張を考慮するなら）：
        textデータ量(bits)=textサンプリング周波数(Hz)timestext量子化ビット数(bits)timestextチャンネル数timestext時間(秒)
    - この計算結果をReactのステートとして管理し、UIに表示します。
    - 録音時間は、録音終了後に確定した値を入力として使用します。

### 2.4. 再生コントロール

- **UI要素**:
    - MUIの`Button`コンポーネントを使用し、再生/一時停止、停止ボタンを実装。
    - 再生ヘッド/インジケーター: 波形上で現在再生中の位置を示す垂直線。
    - タイムスタンプ表示: 現在の再生位置と全体の時間。
- **技術**:
    - **再生ボタンが押された時**:
        - **元の波形データ**と、現在選択されているサンプリング周波数・量子化ビット数の設定値を取得。
        - `utils/audioUtils.js` 内のリサンプリング関数と量子化関数を呼び出し、**新しい`AudioBuffer`を生成**する。この処理は`AudioWorklet`にデータを送り、処理結果を受け取る形にする。
        - **`AudioWorklet`**: ここでWeb Audio APIの機能を使って実際の音声データのリサンプリングと再量子化を行う。これにより、メインスレッドのブロックを防ぎ、スムーズな再生を実現。
        - 生成された`AudioBuffer`を`AudioBufferSourceNode`に渡し、再生する。

### 2.5. 録音データの管理とエクスポート

- **UI要素**:
    - MUIの`List`や`ListItem`で録音リストを表示。
    - MUIの`IconButton`で各録音の削除ボタン。
    - MUIの`Button`でWAVファイルエクスポートボタン。
- **技術**:
    - **元の波形の保持**: `IndexedDB`に保存する際、マイクから録音した**元の高音質の`AudioBuffer`*を保存します。これにより、いつでも元の音質に戻して編集し直すことができます。
    - エクスポート時にも、選択されたサンプリング周波数と量子化ビット数で**エクスポート用の`AudioBuffer`を生成**し、WAVファイルとしてダウンロードさせる。この処理も`AudioWorklet`を使ってバックグラウンドで行うことで、UXを損なわないようにする。

---

### 3. 技術スタックと役割 (調整なし、MUIの明記)

- **フロントエンド**:
    - **React**: UI構築、状態管理。
    - **MUI (Material-UI)**: UIコンポーネント。
    - **HTML/CSS**: アプリの構造とスタイリング。
    - **JavaScript (ES6+)**: アプリケーションロジック、データ処理。
    - **Web Audio API**: 音声の入出力、基本的な処理。
    - **HTML5 Canvas**: 波形の視覚化。
    - **`AudioWorklet`**: メインスレッドから分離した高負荷な音声処理（リサンプリング、再量子化）。
    
- **開発ツール**:
    - **npm**: パッケージ管理。
    - **Vite/create-react-app**: プロジェクトのビルドと開発サーバー。
- **デプロイ**:
    - **Netlify**: フロントエンドアプリケーションのホスティング。

---

### 4. ディレクトリ構成 (調整なし、具体的なMUIコンポーネントの示唆を追加)

```
my-audio-editor/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── RecordingControls.tsx
│   │   ├── PlaybackControls.tsx
│   │   ├── WaveformDisplay.tsx
│   │   ├── AudioSettings.tsx
│   │   ├── RecordList.tsx
│   │   └── Layout.tsx
│   ├── hooks/
│   │   ├── useAudioProcessor.ts
│   │   └── useWaveformRenderer.ts
│   ├── utils/
│   │   ├── audioUtils.ts
│   │   ├── canvasUtils.ts
│   │   └── storageUtils.ts
│   ├── audio-worklets/
│   │   ├── AudioProcessor.ts
│   │   └── workletLoader.ts
│   ├── App.tsx
│   ├── index.tsx
│   ├── styles/
│   │   ├── theme.ts
│   │   ├── App.css
│   │   └── global.css
│   └── assets/
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

### 6. パフォーマンスとUXへの配慮 (調整点含む)

- **5秒録音制限**: 短い録音時間にすることで、データ量が限られ、リサンプリングや再量子化の処理負荷が大幅に軽減されます。
- **ラジオボタン**: 連続的なスライダーよりも、選択肢が限られるためUIの複雑さが減り、高校生にも直感的に操作しやすくなります。処理側も、選択肢に応じた明確な処理パスで実装しやすいです。
- **波形表示の即時反映**: ラジオボタンでの選択変更が、**すぐに波形に視覚的に反映される**ことで、ユーザーは音の変化を直感的に捉えられます。この描画処理は、実際の音声変換（重い処理）とは別に行われるため、高速です。
- **再生時のみの音声変換**: 実際に再生ボタンを押したときにのみ、`AudioWorklet`を使って音声データをリサンプリング・再量子化することで、不要な計算を避け、再生開始までの遅延を最小限に抑えます。
- **元の波形の保持**: `useAudioProcessor`カスタムフック内で、マイクから取得した**元の高音質`AudioBuffer`*を常に保持し、`IndexedDB`にもそれを保存します。これにより、いつでも「元の音質」に戻したり、異なる設定で再変換したりすることが可能になり、ユーザーは安心して実験できます。
- **MUIの活用**: 標準的なUIコンポーネントを使用することで、開発時間を短縮しつつ、Material Designに基づいたクリーンで使いやすいインターフェースを提供できます。
- **将来の拡張性**: ラジオボタンで選択した値も内部的には数値として処理するため、将来的にスライダーによる連続的な変更に切り替える際も、コアの音声変換ロジックを大きく変更する必要はありません。
- **データ量表示の統合**: サンプリング周波数と量子化ビット数の設定UIの近くにデータ量表示を配置することで、高校生がそれぞれの設定値がデータサイズにどう影響するかを**視覚的に、かつ即座に理解**できるようにします。

この設計は、指定された制約と目標をすべて考慮し、高校生がChromebookで楽しく、そして教育的に利用できる音声波形エディタの実現を目指します。