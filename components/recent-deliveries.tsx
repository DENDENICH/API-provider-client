import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function RecentDeliveries() {
  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
          <AvatarFallback>LP</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">L'Oréal Professional</p>
          <p className="text-sm text-muted-foreground">Поставка #12345</p>
        </div>
        <div className="ml-auto font-medium">
          <Badge variant="outline" className="ml-2 bg-orange-100 text-orange-800 hover:bg-orange-100">
            В доставке
          </Badge>
        </div>
      </div>
      <div className="flex items-center">
        <Avatar className="flex h-9 w-9 items-center justify-center space-y-0 border">
          <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
          <AvatarFallback>CL</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Clarins</p>
          <p className="text-sm text-muted-foreground">Поставка #12344</p>
        </div>
        <div className="ml-auto font-medium">
          <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">
            Доставлен
          </Badge>
        </div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
          <AvatarFallback>GH</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Gehwol</p>
          <p className="text-sm text-muted-foreground">Поставка #12343</p>
        </div>
        <div className="ml-auto font-medium">
          <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100">
            Собран
          </Badge>
        </div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
          <AvatarFallback>JC</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Janssen Cosmetics</p>
          <p className="text-sm text-muted-foreground">Поставка #12342</p>
        </div>
        <div className="ml-auto font-medium">
          <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            В обработке
          </Badge>
        </div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
          <AvatarFallback>KR</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Kérastase</p>
          <p className="text-sm text-muted-foreground">Поставка #12341</p>
        </div>
        <div className="ml-auto font-medium">
          <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">
            Доставлен
          </Badge>
        </div>
      </div>
    </div>
  )
}
