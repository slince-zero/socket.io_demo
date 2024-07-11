import http from 'http'
import { Server } from 'socket.io'

const server = http.createServer()
const io = new Server(server, {
  cors: true, // 允许跨域
})

// 定义房间格式
/**
 * {
 *   1号房间：[{name: 'xxx', room：'xxx',id: 'xxx'}, {name: 'xxx', room：'xxx',id: 'xxx'}, {name: 'xxx', id: 'xxx'}],
 *   2号房间：[{name: 'xxx', room：'xxx',id: 'xxx'}],
 *   3号房间：[]
 * }
 *  一号房间有三个人，二号房间有一个人，三号房间没有人
 */
const groupMap = {}
io.on('connection', (socket) => {
  // 加入房间
  /**
   * @param {string} name 名字
   * @param {string} room 房间号
   */
  socket.on('join', ({ name, room }) => {
    socket.join(room)
    if (groupMap[room]) {
      // 已有就添加
      groupMap[room].push({ name, room, id: socket.id })
    } else {
      // 没有就默认创建一个
      groupMap[room] = [{ name, room, id: socket.id }]
    }
    socket.emit('groupMap', groupMap)
    // 广播，让所有人都可以看到
    socket.broadcast.emit('groupMap', groupMap)

    socket.broadcast.to(room).emit('message', {
      name: '系统消息',
      message: `${name} 加入了群聊`,
    })
  })

  socket.on('message', ({ name, message, room }) => {
    socket.to(room).emit('message', { name, message })
  })
})

server.listen(3002, () => {
  console.log('listening on 3002')
})
