using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;
using XPlatform;

namespace XPlatform
{
    public interface IOperation
    {
        Task<String> AsyncRead();
        Task AsyncWrite(String message);
    }
    public class TransportService: IOperation
    {
        UdpClient trasport = new UdpClient();

        public TransportService(IPEndPoint broker)
        {
            trasport.Connect(broker);
        }
        public async Task<string> AsyncRead()
        {
            var rec = await trasport.ReceiveAsync();
            return ASCIIEncoding.ASCII.GetString(rec.Buffer, 0, rec.Buffer.Length);
        }

        public async Task AsyncWrite(string message)
        {
            byte[] bytes = ASCIIEncoding.ASCII.GetBytes(message);
            trasport.SendAsync(bytes, bytes.Length);
        }
    }

    public class BrokerService : IOperation
    {
        UdpClient trasport = new UdpClient();
        HashSet<IPEndPoint> receivers = new HashSet<IPEndPoint>();

        public BrokerService()
        {
            trasport = new UdpClient(32123);
        }
        public async Task<string> AsyncRead()
        {
            var rec = await trasport.ReceiveAsync();
            string s = ASCIIEncoding.ASCII.GetString(rec.Buffer, 0, rec.Buffer.Length);
            if(s.Equals("subscribe")){
                receivers.Add(rec.RemoteEndPoint);
            }
            return s;
        }

        public async Task AsyncWrite(string message)
        {
            byte[] bytes = ASCIIEncoding.ASCII.GetBytes(message);

            receivers.ToList().ForEach(r => { 
                trasport.SendAsync(bytes, bytes.Length, r); 
            });
        }
    }
}