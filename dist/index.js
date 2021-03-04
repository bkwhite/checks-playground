"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = __importDefault(require("@actions/core"));
const github_1 = __importDefault(require("@actions/github"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const GITHUB_TOKEN = core_1.default.getInput('GITHUB_TOKEN');
        const octokit = github_1.default.getOctokit(GITHUB_TOKEN);
        const { context } = github_1.default;
        const { repository } = context.payload;
        yield octokit.checks.create({
            owner: repository.owner.login,
            repo: repository.full_name,
            name: 'Cypress Check',
            head_sha: context.sha,
            details_url: "https://www.soomolearning.com/",
            conclusion: 'neutral'
        });
    });
}
run();
//# sourceMappingURL=index.js.map