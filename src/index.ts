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


    if (core.getInput("name")) {
        const id = core.getInput("check_id");
        core.debug(`Updating a Run on ${ownership.owner}/${ownership.repo}@${context.sha} (${id})`);
        const { data } = await octokit.checks.update({
            ...ownership,
            name: 'Soomo Check',
            head_sha: context.sha,
            details_url: 'https://soomolearning.com',
            conclusion: 'success',
        })
        core.info(JSON.stringify(data, null, 2))
    } else {
        core.debug(`Creating a new Run on ${ownership.owner}/${ownership.repo}@${context.sha}`);
        const { data } = await octokit.checks.create({
            ...ownership,
            name: 'Soomo Check',
            head_sha: context.sha,
            details_url: 'https://soomolearning.com',
            started_at: new Date().toISOString(),
            conclusion: 'action_required',
        })
        core.info(JSON.stringify(data, null, 2))
    }
}

run()
