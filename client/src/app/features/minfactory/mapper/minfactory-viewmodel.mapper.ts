import { MinFactoryUser } from '../models/domains/minfactory-user';
import { MinFactoryProfileViewModel } from '../models/viewmodels/minfactory-profile.viewmodel';

export class MinFactoryViewmodelMapper {
  public static domainToProfileViewModel(domain: MinFactoryUser): MinFactoryProfileViewModel {
    const viewModel: MinFactoryProfileViewModel = new MinFactoryProfileViewModel();

    viewModel.createdAt = new Intl.DateTimeFormat('de-DE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(domain.createdAt);
    viewModel.email = domain.email;
    viewModel.role = domain.role;

    return viewModel;
  }
}
