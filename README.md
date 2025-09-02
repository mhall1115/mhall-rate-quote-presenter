# Smart Retail Rate Quotes

This is a standalone web application for generating and managing mortgage rate quotes.

## How to Run This Application

To run this application on your computer, you will need to have [Node.js](https://nodejs.org/) installed.

### Step 1: Install Dependencies

First, open a terminal or command prompt in the project's main directory and run the following command. This will download all the necessary libraries defined in `package.json`.

```bash
npm install
```

### Step 2: Build the Application

Next, compile the application's TypeScript/React code into the simple HTML and JavaScript that browsers can understand. This command creates a `dist` folder containing your standalone app.

```bash
npm run build
```

### Step 3: Run the Local Server

Now, start the local web server. This command serves the contents of the `dist` folder on a local URL.

```bash
npm run serve
```

After running this, your terminal will show a message like `➜ Local: http://localhost:4173/`. Your application is now running! You can open this URL in your regular web browser to use it.

---

## How to Run This in Microsoft Excel

This application can be run as an Office Add-in inside Excel.

### Prerequisite

You must complete all the steps above and have the local server running (`npm run serve`). The server must remain running while you are using the add-in in Excel.

### Step 1: Sideload the Add-in

With the local server running, you can now "sideload" the `manifest.xml` file into Excel to make the connection.

1.  **Open Excel** (on Desktop or Web).
2.  Go to the **Insert** tab on the ribbon.
3.  Click **My Add-ins**.
4.  In the Office Add-ins dialog, select the **My Organization** tab, and then choose **Upload My Add-in**.
5.  Browse to the `public` folder within this project directory.
6.  Select the **`manifest.xml`** file and click **Upload**.

A new button for "Smart Retail Rate Quotes" should now appear on your **Home** tab in the Excel ribbon. Clicking it will open the application in a task pane, loading directly from your local server.

---

## Deploying to GitHub Pages

You can host this application for free on GitHub Pages. This allows anyone to access your app via a public URL.

### Step 1: Create a GitHub Repository

1.  Create a new **public** repository on your GitHub account named exactly `mhall-rate-quote-presenter`.
2.  The configuration files (`vite.config.ts` and `package.json`) have been pre-configured for this specific repository name under the username `mhall1115`.
3.  Push the code from your local machine to this new repository.

### Step 2: Deploy the Application

In your local project terminal, run the deployment command:

```bash
npm run deploy
```

This command will first build the application (`predeploy` script) and then publish the contents of the `dist` folder to a special branch named `gh-pages` in your GitHub repository.

### Step 3: Configure GitHub Pages Settings

1.  Go to your `mhall1115/mhall-rate-quote-presenter` repository on GitHub.
2.  Click on the **Settings** tab.
3.  In the left sidebar, click on **Pages**.
4.  Under "Build and deployment", for the "Source", select **Deploy from a branch**.
5.  For the "Branch", select `gh-pages` and keep the folder as `/ (root)`. Click **Save**.

GitHub will now publish your site. It may take a few minutes.

### Step 4: Visit Your Live Site

Once published, your application will be available at `https://mhall1115.github.io/mhall-rate-quote-presenter/`.