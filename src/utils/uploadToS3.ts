import fs from 'fs'
import AWS from 'aws-sdk'

interface FileObject {
    path: string
    name: string
    type: string
}

function getFiles(dir: string, fileList: FileObject[] = []) {
    const files = fs.readdirSync(dir)

    files.forEach((file) => {
        const filePath = `${dir}/${file}`
        if (['.gitkeep', '.Trash-0'].indexOf(file) === -1) {
            if (fs.statSync(filePath).isDirectory()) {
                getFiles(filePath, fileList)
            } else {
                const obj = {
                    path: filePath,
                    name: file,
                    type: file.split('.')[1],
                }
                fileList.push(obj)
            }
        }
    })

    return fileList
}

export function uploadVideos(config: {
    VIDEO_FOLDER: string
    FOLDER_IN_BUCKET: string
    BUCKET_NAME: string
    AWS_ACCESS_ID: string
    AWS_SECRET_KEY: string
}) {
    const videosDir = config.VIDEO_FOLDER
    const videos = getFiles(videosDir, [])

    const uploadToS3 = (file: Buffer, name: string, type: string) => {
        const s3 = new AWS.S3({
            accessKeyId: config.AWS_ACCESS_ID,
            secretAccessKey: config.AWS_SECRET_KEY,
        })

        const params = {
            Bucket: String(config.BUCKET_NAME),
            Key: `notebook/${config.FOLDER_IN_BUCKET}/${name}`,
            Body: file,
            ACL: 'public-read',
            ContentType: `image/${type}`,
        }

        s3.upload(params, {}, (err, data) => {
            if (err) console.error(err)
            console.log(data)
        })
    }

    videos.forEach((videoObject) => {
        fs.readFile(videoObject.path, (err, data) => {
            if (err) {
                throw err
            }
            uploadToS3(data, videoObject.name, videoObject.type)
        })
    })
}
