import fs from 'fs'
import path from 'path'
import * as core from '@actions/core'
import * as github from '@actions/github'

async function run() {
    const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN')
    const octokit = github.getOctokit(GITHUB_TOKEN)

    const { context } = github

    const { repository } = context.payload

    const ownership = {
        owner: context.repo.owner,
        repo: context.repo.repo,
    }

    core.info(
        `Creating a new Run on ${ownership.owner}/${ownership.repo}@${context.sha}`
    )

    const { data } = await octokit.checks.create({
        ...ownership,
        name: 'Soomo Check',
        head_sha: context.sha,
        details_url: 'https://soomolearning.com',
        // started_at: new Date().toISOString(),
        conclusion: 'success',
        output: {
            title: "Check Output",
            summary: fs.readFileSync(path.join(__dirname, 'summary.md'), 'utf-8'),
        }
    })

    core.info("DONE")

    core.info(JSON.stringify(data, null, 2))
}

run()
