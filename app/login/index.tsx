import { SignInForm } from '@/components/sign-in-form';
import { MopedLogo } from '@/components/moped-logo';
import { ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { useColorScheme } from 'nativewind';

export default function SignInScreen() {
  const { colorScheme } = useColorScheme();
  const logoColor = colorScheme === 'dark' ? '#ffffff' : '#1BA74E';

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="sm:flex-1 items-center justify-center p-4 py-8 sm:py-4 sm:p-6 mt-safe"
      keyboardDismissMode="interactive">
      <View className="w-full max-w-sm gap-6">
        <View className="items-center gap-3">
          <MopedLogo color={logoColor} width={80} />
          <Text className="font-heading-bold text-2xl tracking-tight">Local Bean</Text>
        </View>
        <SignInForm />
      </View>
    </ScrollView>
  );
}
