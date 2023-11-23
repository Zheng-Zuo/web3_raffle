import { truncateText } from '@/utils'
import { FaEthereum } from 'react-icons/fa'
import { BsQrCode } from 'react-icons/bs'
import Tooltip from '@mui/material/Tooltip'

interface Props {
  address: string;
  amount: number;
  tickets: number;
}

const PlayerCard = (
  player: Props
) => {
  return (
    <tr className="border border-emerald-300/20">

      <td className="text-sm font-light px-6 py-4 whitespace-nowrap">
        <div className="flex justify-start items-center space-x-2">
          <Tooltip title={player.address} placement="top">
            <div>
              <BsQrCode />
            </div>
          </Tooltip>
          <Tooltip title={player.address} placement="top">
            <span>{truncateText(player.address, 4, 4, 11)}</span>
          </Tooltip>
        </div>
      </td>

      <td className="text-sm font-light px-6 py-4 whitespace-nowrap">
        <small className="flex justify-start items-center space-x-1">
          <FaEthereum />
          <span className="font-medium">
            {player.amount.toFixed(2)} ETH
          </span>
        </small>
      </td>

      <td className="text-sm font-light px-6 py-4 whitespace-nowrap">
        {player.tickets}
      </td>
    </tr>
  )
}

export default PlayerCard
