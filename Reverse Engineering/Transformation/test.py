chaine ='灩捯䍔䙻ㄶ形楴獟楮獴㌴摟潦弸形㝦㘲捡㕽'
for char in chaine: print(ord(char))
for char in ord(chaine): 
    dividende = ord(char)
    diviseur = 256
    quotient = dividende // diviseur
    reste = dividende % diviseur
    print(f"Character: {char}, Ord: {dividende}, Quotient: {quotient}, Reste: {reste}")