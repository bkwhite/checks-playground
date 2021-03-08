import fs from 'fs'
import path from 'path'
import * as core from '@actions/core'
import * as github from '@actions/github'

import { formatSummaryData, buildSummaryData } from './summary'
import { MochawesomeOutput } from './types'
import { uploadVideos } from './utils/uploadToS3'

function buildSummary(outputFilePath: string, videoUrls: string[]) {
    const outputJson = fs.readFileSync(path.join(outputFilePath), 'utf-8')

    return formatSummaryData(
        buildSummaryData(JSON.parse(outputJson) as MochawesomeOutput, videoUrls)
    )
}

async function run() {
    const GITHUB_TOKEN = core.getInput('token', { required: true })
    const CYPRESS_FOLDER = core.getInput('cypress_folder', { required: true })
    const BUCKET_NAME = core.getInput('BUCKET_NAME')
    const BRANCH_NAME = core.getInput('BRANCH_NAME')
    const AWS_ACCESS_ID = core.getInput('AWS_ACCESS_ID')
    const AWS_SECRET_KEY = core.getInput('AWS_SECRET_KEY')
    const octokit = github.getOctokit(GITHUB_TOKEN)

    const { context } = github
    const ownership = {
        owner: context.repo.owner,
        repo: context.repo.repo,
    }

    const videoUrls = await uploadVideos({
        VIDEO_FOLDER: `${CYPRESS_FOLDER}/videos`,
        FOLDER_IN_BUCKET: BRANCH_NAME,
        BUCKET_NAME,
        AWS_ACCESS_ID,
        AWS_SECRET_KEY,
    })

    const { data } = await octokit.checks.create({
        ...ownership,
        name: 'Soomo Check',
        head_sha: context.sha,
        details_url: 'https://soomolearning.com',
        // started_at: new Date().toISOString(),
        conclusion: 'success',
        output: {
            title: 'Check Output',
            summary: buildSummary(`${CYPRESS_FOLDER}/reports/output.json`, videoUrls),
        },
    })

    core.info('DONE')

    core.info(JSON.stringify(data, null, 2))
}

run()
