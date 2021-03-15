import fs from 'fs'
import AWS from 'aws-sdk'

interface FileObject {
    path: string
    name: string
    type: string
}

export function getFiles(dir: string, fileList: FileObject[] = []) {
    if (!fs.existsSync(dir)) {
        return []
    }

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

export async function uploadFolder(config: {
    LOCAL_FOLDER: string
    FOLDER_IN_BUCKET: string
    BUCKET_NAME: string
    AWS_ACCESS_ID: string
    AWS_SECRET_KEY: string
}) {
    const localDir = config.LOCAL_FOLDER
    const files = getFiles(localDir, [])

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

        return s3.upload(params)
    }

    return Promise.all(
        files.map((fileObject) => {
            return new Promise<AWS.S3.ManagedUpload.SendData>(
                (resolve, reject) => {
                    fs.readFile(fileObject.path, async (err, data) => {
                        if (err) {
                            reject(err)
                        }
                        resolve(
                            uploadToS3(
                                data,
                                fileObject.name,
                                fileObject.type
                            ).promise()
                        )
                    })
                }
            )
                .then((v) => v.Location)
                .catch((e) => {
                    throw e
                })
        })
    )
}
