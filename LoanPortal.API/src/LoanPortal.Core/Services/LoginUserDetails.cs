using LoanPortal.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LoanPortal.Core.Services;
public class LoginUserDetails : ILoginUserDetails
{
  private Guid _userId;
  public Guid UserID { get { return _userId; } set => _userId = value; }

  private string _userName;
  public string UserName { get { return _userName; } set => _userName = value; }
  
  private string _phone;
  public string Phone { get { return _phone; } set => _phone = value; }
  
  private string _email;
  public string Email { get { return _email; } set => _email = value; }
    public LoginUserDetails()
  {
  }
}
