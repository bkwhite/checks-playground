import { MochawesomeOutput, TestSummary } from './types'

export function buildSummaryData(
    cypressOutput: MochawesomeOutput,
    videoUrls: string[]
) {
    return cypressOutput.results.reduce<TestSummary[]>((accum, r) => {
        return [
            ...accum,
            ...r.suites.map<TestSummary>((s) => {
                const featureFileMatch = r.fullFile.match(
                    /([\w+\.*]+)\.feature/
                )
                const featureFile = featureFileMatch ? featureFileMatch[0] : ''
                return {
                    featureFile: featureFile,
                    videoUrl: videoUrls.find((url) =>
                        url.includes(featureFile)
                    ),
                    title: s.title,
                    pass: s.failures.length > 0 ? false : true,
                    duration: Math.round(s.duration / 1000),
                    steps: s.tests.map<TestSummary>((s) => ({
                        title: s.title,
                        pass: s.pass,
                        duration: Math.round(s.duration / 1000),
                    })),
                }
            }),
        ]
    }, [])
}

export function formatSummaryData(summaryData: TestSummary[]) {
    let document = '# Test Results\n'

    summaryData.forEach((d) => {
        document += `## 📃 ${d.featureFile} ${
            d.videoUrl ? `([screen recording](${d.videoUrl}))` : ''
        }\n`
        document += `### ${d.pass ? `✅` : `❌`} ${d.title} (${
            d.duration
        }s ⏱️)\n`
        d.steps?.forEach((s) => {
            document += `- ${s.pass ? `✅` : `❌`} ${s.title}\n`
        })
    })

    return document
}

/*
function buildSummary(outputFilePath: string) {
    const outputJson = fs.readFileSync(path.join(outputFilePath), 'utf-8')

    return formatSummaryData(
        buildSummaryData(JSON.parse(outputJson) as MochawesomeOutput)
    )
}

console.log(
    buildSummary(
        path.join(__dirname, '..', 'cypress', 'reports', 'output.json')
    )
)
*/
