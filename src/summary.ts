import { MochawesomeOutput, TestSummary } from './types'
import output from './static/output.json'

export function buildSummaryData(cypressOutput: MochawesomeOutput) {
    return cypressOutput.results.reduce<TestSummary[]>((accum, r) => {
        return [
            ...accum,
            ...r.suites.map<TestSummary>((s) => ({
                title: s.title,
                conclusion: s.failures.length > 0 ? 'fail' : 'pass',
                duration: s.duration,
            })),
        ]
    }, [])
}

export function formatSummaryData(summaryData: TestSummary[]) {
    let document = '### Test Results\n'

    summaryData.forEach((d) => {
        document =
            `${document}` +
            `- **${d.title}**: ${d.conclusion.toLocaleUpperCase()} *(${Math.floor(
                d.duration / 1000
            )} seconds)* \n`
    })

    return document
}
