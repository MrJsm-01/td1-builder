export const DOM = {
  body        : document.body,
  loader      : document.querySelector('#loader'),
  shareButton : document.querySelector('#share-build'),
  modal       : {
    backdrop  : document.querySelector('.modal-backdrop'),
    container : document.querySelector('.modal-container'),
    close     : document.querySelector('#close-modal')
  },
  slots : {
    primary   : document.querySelector('#wp-primary-select'),
    secondary : document.querySelector('#wp-secondary-select'),
    handgun   : document.querySelector('#wp-handgun-select')
  },
  score : {
    primary   : document.querySelector('#wp-primary-gs'),
    secondary : document.querySelector('#wp-secondary-gs'),
    handgun   : document.querySelector('#wp-handgun-gs')
  },
  gear : {
    chest    : document.querySelector('#gp-chest'),
    mask     : document.querySelector('#gp-mask'),
    kneepads : document.querySelector('#gp-kneepads'),
    backpack : document.querySelector('#gp-backpack'),
    gloves   : document.querySelector('#gp-gloves'),
    holster  : document.querySelector('#gp-holster')
  },
  skills : {
    skill1   : document.querySelector('#skill1'),
    skillUlt : document.querySelector('#skill-ult'),
    skill2   : document.querySelector('#skill2')
  },
  player_talents : {
    talent1 : document.querySelector('#talent1'),
    talent2 : document.querySelector('#talent2'),
    talent3 : document.querySelector('#talent3'),
    talent4 : document.querySelector('#talent4')
  }
};
