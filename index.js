const exec = require("@actions/exec");
const core = require("@actions/core");
const github = require("@actions/github");
const fs = require("fs");
const path = require("path");
const simpleGit = require("simple-git");

function getDrawIOFiles(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach((file) => {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getDrawIOFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith(".drawio")) {
        arrayOfFiles.push(path.join(__dirname, dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

async function checkoutToBranch(branch, token) {
  const url = `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}.git`.replace(
    /^https:\/\//,
    `https://x-access-token:${token}@`
  );

  const git = simpleGit();
  await git.addRemote("repo", url);
  await git.fetch("repo");
  await git.checkout(branch);
  return git;
}

async function commitChanges(filesToCommit, commitMessage, git, branch) {
  const diff = await exec.exec("git", ["diff", "--quiet"], {
    ignoreReturnCode: true,
  });

  if (diff) {
    await core.group("push changes", async () => {
      await git.addConfig("user.email", `actions@github.com`);
      await git.addConfig("user.name", "GitHub Actions");
      await git.add(filesToCommit);
      await git.commit(commitMessage);
      await git.push("repo", branch);
    });
  } else {
    console.log("No changes to make");
  }
}

function getBranchName() {
  if (github.context.eventName == "pull_request") {
    return github.context.payload.pull_request.head.ref;
  } else {
    core.error("This action will only work on Pull Requests. Exiting.");
    return null;
  }
}

async function run() {
  const token = core.getInput("GH_TOKEN");
  let ignorePaths = core.getInput("IGNORE_FILE_PATTERNS");
  let commitMessage = core.getInput("COMMIT_MESSAGE");

  if (!ignorePaths) {
    ignorePaths = [];
  }

  core.info("Ignore File Patterns: " + JSON.stringify(ignorePaths));

  if (!commitMessage) {
    commitMessage = "Render diagrams";
  }

  try {
    // const branch = getBranchName();
    // if (!branch) {
    //   return;
    // }
    // const git = await checkoutToBranch(branch, token);

    const drawIOFiles = getDrawIOFiles(".");
    const renderedFiles = [];

    for (const df of drawIOFiles) {
      core.info(`Rendering ${df}`);
      const rf = df.replace(".drawio", ".png");
      await exec.exec("./node_modules/draw.io-export/bin/drawio.js", [
        df,
        "-o",
        rf,
      ]);
      renderedFiles.push(rf);
    }

    core.info(`Rendered: ${renderedFiles}`);

    // if (renderedFiles) {
    //   await core.group("push changes", async () => {
    //     await git.addConfig("user.email", `actions@github.com`);
    //     await git.addConfig("user.name", "GitHub Actions");
    //     await git.add(renderedFiles);
    //     await git.commit(commitMessage);
    //     await git.push("repo", branch);
    //   });
    // }
  } catch (error) {
    core.setFailed(error);
  }
}

run();
